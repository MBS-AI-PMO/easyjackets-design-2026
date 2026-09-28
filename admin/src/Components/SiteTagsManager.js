import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BASE_URL } from '../constant/url';

const booleanAttributes = new Set(['async', 'defer', 'nomodule']);
const supportedTagTypes = new Set(['meta', 'link', 'script', 'title', 'style', 'noscript']);

const getAttributesFromElement = (element) => {
  return Array.from(element.attributes).reduce((attrs, attr) => {
    attrs[attr.name] = booleanAttributes.has(attr.name) && attr.value === '' ? true : attr.value;
    return attrs;
  }, {});
};

const getParsedTagName = (baseName, element, index, total) => {
  const tagName = element.tagName.toLowerCase();
  const src = element.getAttribute('src') || '';
  const content = element.textContent || '';

  if (total === 1) return baseName || tagName;
  if (tagName === 'script' && src.includes('googletagmanager.com/gtag/js')) return `${baseName || 'Google Analytics'} Loader`;
  if (tagName === 'script' && content.includes("gtag('config'")) return `${baseName || 'Google Analytics'} Config`;
  return `${baseName || 'Head Tag'} ${index + 1}`;
};

const parseHeadSnippet = (snippet, baseName, isActive) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(`<head>${snippet}</head>`, 'text/html');
  const elements = Array.from(document.head.children).filter((element) =>
    supportedTagTypes.has(element.tagName.toLowerCase())
  );

  return elements.map((element, index) => {
    const tagType = element.tagName.toLowerCase();
    return {
      name: getParsedTagName(baseName, element, index, elements.length),
      tagType,
      attributes: getAttributesFromElement(element),
      content: ['script', 'title', 'style', 'noscript'].includes(tagType) ? element.textContent.trim() : '',
      isActive,
    };
  });
};

const formatTagDetails = (tag) => {
  const hasAttributes = tag.attributes && typeof tag.attributes === 'object' && Object.keys(tag.attributes).length > 0;
  const attributes = hasAttributes ? JSON.stringify(tag.attributes, null, 2) : '';
  const content = tag.content || '';

  return [attributes, content].filter(Boolean).join('\n\n') || '""';
};

const SiteTagsManager = () => {
  const [tags, setTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState({
    name: '',
    tagType: 'meta',
    attributes: '',
    content: '',
    snippet: '',
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/sitetags`);
      if (res.data.success) {
        setTags(res.data.tags);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleOpen = (tag = null) => {
    if (tag) {
      setCurrentTag({
        ...tag,
        snippet: '',
        attributes: typeof tag.attributes === 'object' ? JSON.stringify(tag.attributes, null, 2) : tag.attributes || ''
      });
      setIsEditing(true);
    } else {
      setCurrentTag({ name: '', tagType: 'meta', attributes: '', content: '', snippet: '', isActive: true });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTag({ name: '', tagType: 'meta', attributes: '', content: '', snippet: '', isActive: true });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (!isEditing && currentTag.snippet.trim()) {
        const parsedTags = parseHeadSnippet(currentTag.snippet, currentTag.name, currentTag.isActive);

        if (parsedTags.length === 0) {
          alert('No supported head tags found in the pasted snippet');
          return;
        }

        await Promise.all(parsedTags.map((tag) => axios.post(`${BASE_URL}/sitetags`, tag)));
        fetchTags();
        handleClose();
        return;
      }

      const { snippet, ...tagFields } = currentTag;
      const payload = {
        ...tagFields,
      };

      // Try parsing attributes if provided
      if (payload.attributes && typeof payload.attributes === 'string') {
        try {
          payload.attributes = JSON.parse(payload.attributes);
        } catch (e) {
          alert('Attributes must be valid JSON');
          return;
        }
      }

      if (isEditing) {
        await axios.put(`${BASE_URL}/sitetags/${currentTag._id}`, payload);
      } else {
        await axios.post(`${BASE_URL}/sitetags`, payload);
      }
      fetchTags();
      handleClose();
    } catch (err) {
      console.error('Error saving tag:', err);
      alert('Error saving tag');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await axios.delete(`${BASE_URL}/sitetags/${id}`);
        fetchTags();
      } catch (err) {
        console.error('Error deleting tag:', err);
      }
    }
  };

  const handleToggleActive = async (tag) => {
    try {
      await axios.put(`${BASE_URL}/sitetags/${tag._id}`, { ...tag, isActive: !tag.isActive });
      fetchTags();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Website Head Tags</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add New Tag</Button>
      </Box>

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'hidden' }}>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            '& th, & td': {
              verticalAlign: 'top',
              px: 2,
              py: 1.5,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 130 }}><strong>Name</strong></TableCell>
              <TableCell sx={{ width: 85 }}><strong>Type</strong></TableCell>
              <TableCell><strong>Attributes / Content</strong></TableCell>
              <TableCell sx={{ width: 85 }}><strong>Status</strong></TableCell>
              <TableCell sx={{ width: 105 }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag._id}>
                <TableCell sx={{ wordBreak: 'break-word' }}>{tag.name}</TableCell>
                <TableCell>{tag.tagType.toUpperCase()}</TableCell>
                <TableCell>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {formatTagDetails(tag)}
                  </pre>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Switch
                    checked={tag.isActive}
                    onChange={() => handleToggleActive(tag)}
                    color="primary"
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton color="primary" onClick={() => handleOpen(tag)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(tag._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No tags found. Add one!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name (e.g. Google Fonts, Meta Description)"
            margin="normal"
            value={currentTag.name}
            onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
          />

          {!isEditing && (
            <TextField
              fullWidth
              label="Paste Full Head Tag or Snippet"
              multiline
              rows={5}
              margin="normal"
              placeholder={`Paste code like:
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXX');
</script>`}
              value={currentTag.snippet}
              onChange={(e) => setCurrentTag({ ...currentTag, snippet: e.target.value })}
              helperText="Optional. Paste provider code exactly as given; the system will split multiple tags automatically."
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Tag Type</InputLabel>
            <Select
              value={currentTag.tagType}
              onChange={(e) => setCurrentTag({ ...currentTag, tagType: e.target.value })}
            >
              <MenuItem value="meta">Meta Tag (&lt;meta&gt;)</MenuItem>
              <MenuItem value="link">Link Tag (&lt;link&gt;)</MenuItem>
              <MenuItem value="script">Script Tag (&lt;script&gt;)</MenuItem>
              <MenuItem value="title">Title Tag (&lt;title&gt;)</MenuItem>
              <MenuItem value="style">Style Tag (&lt;style&gt;)</MenuItem>
              <MenuItem value="noscript">No-Script Tag (&lt;noscript&gt;)</MenuItem>
            </Select>
          </FormControl>

          {['meta', 'link', 'script'].includes(currentTag.tagType) && (
            <TextField
              fullWidth
              label="Attributes (JSON format)"
              multiline
              rows={4}
              margin="normal"
              placeholder='e.g. {"name": "description", "content": "My amazing site"}'
              value={currentTag.attributes}
              onChange={(e) => setCurrentTag({ ...currentTag, attributes: e.target.value })}
              helperText="Must be valid JSON formatting."
            />
          )}

          {['script', 'title', 'style', 'noscript'].includes(currentTag.tagType) && (
            <TextField
              fullWidth
              label="Inner Content (Text/HTML/JS)"
              multiline
              rows={4}
              margin="normal"
              value={currentTag.content}
              onChange={(e) => setCurrentTag({ ...currentTag, content: e.target.value })}
            />
          )}

          <FormControlLabel
            control={<Switch checked={currentTag.isActive} onChange={(e) => setCurrentTag({ ...currentTag, isActive: e.target.checked })} color="primary" />}
            label="Active"
            sx={{ mt: 2 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteTagsManager;
