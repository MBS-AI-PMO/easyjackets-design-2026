import Feature from '../models/features.js';
import NewsletterSubscriber from '../models/newsletterSubscriberModel.js';
import formidable from 'formidable'; // For file uploads
import uploadToS3 from '../helpers/fileUpload.js'; // Assuming you have a utility function to upload to S3
import website from '../models/websiteModal.js';
import Blog from '../models/blogs.js'
import slugify from 'slugify';
import { sendEmail } from '../helpers/email.js';
import { getAdminEmail } from '../helpers/emailSettings.js';
import { BLOG_IMAGE_FOLDER, blogImageUrl, moveInlineImagesToStorage } from '../helpers/blogImages.js';

// Create or Update Feature
export const createOrUpdateFeatureController = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error parsing the files.' });
        }

        const { review } = fields;
        let imageUrls = [];


        // Handle image uploads
        if (files.images) {
            const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
            for (const file of imageFiles) {
                const url = await uploadToS3(file);
                imageUrls.push(`${process.env.AWS_FILE_PATH}${url}`);
            }
        }

        try {
            // Find the feature by name
            let feature = await Feature.find();

            if (feature.length !== 0) {
                // If the feature exists, update it
                feature[0].review = JSON.parse(review[0]); // Update the data
                if (imageUrls.length !== 0) {
                    feature[0].banner = imageUrls; // Update the images
                }
                await feature[0].save();
                return res.status(200).json({
                    success: true,
                    message: "Feature updated successfully",
                    feature
                });
            } else {
                // If it does not exist, create a new feature
                feature = await Feature.create({ review: JSON.parse(review[0]), banner: imageUrls });
                return res.status(201).json({
                    success: true,
                    message: "Feature created successfully",
                    feature
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Error creating/updating feature.' });
        }
    });
};

// Get All Features
export const getFeaturesController = async (req, res) => {
    try {
        const features = await Feature.find();
        res.status(200).json({
            success: true,
            features
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching features.' });
    }
};

// Get a Feature by Name
export const getFeatureByNameController = async (req, res) => {
    const { name } = req.params;

    try {
        const feature = await Feature.findOne({ name });
        if (!feature) {
            return res.status(404).json({ success: false, message: 'Feature not found.' });
        }
        res.status(200).json({
            success: true,
            feature
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching feature.' });
    }
};



// GET Controller to retrieve contact details
export const getWebsiteDetails = async (req, res) => {
    try {
        const websites = await website.findOne();

        res.status(200).json({ website: websites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// UPDATE Controller to update contact details
export const updateWebsiteDetails = async (req, res) => {
    const { phoneNumber, email, address, address1, socialLinks, isActive, checkout } = req.body;

    try {
        let websites = await website.findOne();

        if (!websites) {
            websites = new website({
                phoneNumber,
                email,
                address,
                address1,
                socialLinks,
                isActive,
            });
            await websites.save();
        } else {
            websites.phoneNumber = phoneNumber || websites.phoneNumber;
            websites.email = email || websites.email;
            websites.address = address || websites.address;
            websites.address1 = address1 || websites.address1;
            websites.socialLinks = socialLinks || websites.socialLinks;
            websites.isActive = isActive || websites.isActive;
            if (checkout) {
                websites.checkout = { ...websites.checkout, ...checkout };
            }

            await websites.save();
        }

        res.status(200).json({ message: 'website updated successfully', website: websites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


export const createBlogController = async (req, res) => {
    const form = formidable({ multiples: false }); // Single file
    form.parse(req, async (err, fields, files) => {
        if (err) {

            return res.status(500).send('Error parsing the files.');
        }

        try {
            const imageFile = files.image ? files.image[0] : null;
            let imageUrl = '';
            if (imageFile) {
                const uploadedUrl = await uploadToS3(imageFile);
                imageUrl = `${process.env.AWS_FILE_PATH}${uploadedUrl}`;
            }

            // Any image still embedded in the body goes to storage before the
            // document is written — see helpers/blogImages.js.
            const { html: content } = await moveInlineImagesToStorage(fields.content[0], req, {
                namePrefix: slugify(fields.title[0] || 'post').slice(0, 40),
            });

            const data = {
                title: fields.title[0],
                content,
                author: fields.author[0] || 'Easy Jackets',
                image: imageUrl,
                slug: fields.slug ? slugify(fields.slug[0]) : slugify(fields.title[0]),
                category: fields.category ? fields.category[0] : 'Style Guide',
                categoryColor: fields.categoryColor ? fields.categoryColor[0] : '#37a6ff',
                fitImage: fields.fitImage ? fields.fitImage[0] === 'true' : false,
                fitImageScale: fields.fitImageScale ? parseInt(fields.fitImageScale[0]) : 100,
                featured: fields.featured ? fields.featured[0] === 'true' : false,
                isActive: fields.isActive ? fields.isActive[0] === 'true' : true,
                readTime: fields.readTime ? parseInt(fields.readTime[0]) : 5,
                excerpt: fields.excerpt ? fields.excerpt[0] : undefined
            };

            await Blog.create(data);

            return res.status(200).json({
                success: true,
                message: 'Blog created successfully'
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Error uploading files to S3.');
        }
    });
};

// List endpoints leave the article body out. A body can run to megabytes once
// images have been pasted into it, and nothing that draws a list needs it —
// the home page strip, the blog index, the sidebar and the admin table all work
// from title, slug, excerpt, cover and dates. The single-post endpoints below
// still return the body. `lean` skips building Mongoose documents the response
// never uses.
const LIST_FIELDS = '-content -comments';

export const getAllBlogsController = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).select(LIST_FIELDS).lean();
        res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching blogs.');
    }
};

// Get blog by ID
export const getBlogByIdController = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).send('Blog not found.');
        res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching blog.');
    }
};

// Update blog by ID
export const updateBlogController = async (req, res) => {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send('Error parsing the files.');
        }

        try {
            let imageUrl;
            const blog = await Blog.findById(req.params.id);
            if (!blog) return res.status(404).send('Blog not found.');

            // Update image if provided
            if (files.image && files.image[0]) {
                const uploadedUrl = await uploadToS3(files.image[0]);
                imageUrl = `${process.env.AWS_FILE_PATH}${uploadedUrl}`;
            }

            // Any image still embedded in the body goes to storage before the
            // document is written — see helpers/blogImages.js.
            const { html: content } = await moveInlineImagesToStorage(fields.content[0], req, {
                namePrefix: slugify(fields.title?.[0] || blog.slug || 'post').slice(0, 40),
            });

            const updatedData = {
                title: fields.title[0],
                content,
                author: fields.author[0] || blog.author,
                image: imageUrl || blog.image,
                slug: fields.slug ? slugify(fields.slug[0]) : (fields.title ? slugify(fields.title[0]) : blog.slug),
                category: fields.category ? fields.category[0] : blog.category,
                categoryColor: fields.categoryColor ? fields.categoryColor[0] : blog.categoryColor,
                fitImage: fields.fitImage ? fields.fitImage[0] === 'true' : blog.fitImage,
                fitImageScale: fields.fitImageScale ? parseInt(fields.fitImageScale[0]) : blog.fitImageScale,
                featured: fields.featured ? fields.featured[0] === 'true' : blog.featured,
                isActive: fields.isActive ? fields.isActive[0] === 'true' : blog.isActive,
                readTime: fields.readTime ? parseInt(fields.readTime[0]) : blog.readTime,
                excerpt: fields.excerpt ? fields.excerpt[0] : blog.excerpt
            };

            const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });
            res.status(200).json(updatedBlog);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating blog.');
        }
    });
};

/**
 * One image for the article editor.
 *
 * The editor calls this as an image is dropped in, and inserts the URL that
 * comes back. Before this endpoint the editor embedded the image itself into
 * the article as base64, which is how one post came to weigh 8 MB. Goes
 * through the same pipeline as the cover — WebP, long edge capped — into the
 * uploads/blog/ folder.
 */
export const uploadBlogImageController = async (req, res) => {
    const form = formidable({ multiples: false, maxFileSize: 25 * 1024 * 1024 });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'Could not read the image.' });
        }

        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        if (!file) {
            return res.status(400).json({ success: false, message: 'No image was sent.' });
        }
        if (!String(file.mimetype || '').startsWith('image/')) {
            return res.status(400).json({ success: false, message: 'Only images can be uploaded here.' });
        }

        try {
            const key = await uploadToS3(file, null, undefined, { folder: BLOG_IMAGE_FOLDER });
            res.status(200).json({ success: true, url: blogImageUrl(key, req), key });
        } catch (error) {
            console.error('Error uploading blog image:', error);
            res.status(500).json({ success: false, message: 'Could not store the image.' });
        }
    });
};

// Delete blog by ID
export const deleteBlogController = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).send('Blog not found.');
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting blog.');
    }
};

// Get blog by slug
export const getBlogBySlugController = async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug, isActive: true },
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
        res.status(200).json({ success: true, blog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching blog.' });
    }
};

// Get featured blogs
export const getFeaturedBlogsController = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const blogs = await Blog.find({ isActive: true, featured: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select(LIST_FIELDS)
            .lean();
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching featured blogs.' });
    }
};

// Get recent blogs
export const getRecentBlogsController = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const blogs = await Blog.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select(LIST_FIELDS)
            .lean();
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching recent blogs.' });
    }
};

// Get blogs by category
export const getBlogsByCategoryController = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({ category, isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(LIST_FIELDS)
            .lean();

        const total = await Blog.countDocuments({ category, isActive: true });

        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching blogs.' });
    }
};

// Add comment to blog
export const addCommentController = async (req, res) => {
    try {
        const { name, email, content } = req.body;

        if (!name || !email || !content) {
            return res.status(400).json({ success: false, message: 'Name, email, and comment are required.' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });

        blog.comments.push({ name, email, content });
        await blog.save();

        res.status(200).json({ success: true, message: 'Comment added successfully.', comment: blog.comments[blog.comments.length - 1] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding comment.' });
    }
};

// Get comments for blog
export const getCommentsController = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).select('comments');
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });

        const approvedComments = blog.comments.filter(c => c.approved);
        res.status(200).json({ success: true, comments: approvedComments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching comments.' });
    }
};

// Admin: Get all comments across all blogs
export const getAllCommentsController = async (req, res) => {
    try {
        const blogs = await Blog.find().select('title comments');
        let allComments = [];
        blogs.forEach(blog => {
            blog.comments.forEach(comment => {
                allComments.push({
                    _id: comment._id,
                    blogId: blog._id,
                    blogTitle: blog.title,
                    name: comment.name,
                    email: comment.email,
                    content: comment.content,
                    approved: comment.approved,
                    createdAt: comment.createdAt
                });
            });
        });
        allComments.sort((a, b) => b.createdAt - a.createdAt);
        res.status(200).json({ success: true, comments: allComments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching all comments.' });
    }
};

// Admin: Approve/Unapprove comment
export const approveCommentController = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const { approved } = req.body;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });

        const comment = blog.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

        comment.approved = approved;
        await blog.save();

        res.status(200).json({ success: true, message: `Comment ${approved ? 'approved' : 'unapproved'} successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating comment status.' });
    }
};

// Admin: Delete comment
export const deleteCommentController = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });

        blog.comments.pull({ _id: commentId });
        await blog.save();

        res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting comment.' });
    }
};


export const SubmitContact = async (req, res) => {
    try {
        const contactData = {
            ...req.body,
            date: new Date().toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
            })
        };

        // Send email to admin (non-blocking)
        sendEmail(
            `New Contact Form Submission - ${req.body.firstName} ${req.body.lastName}`,
            await getAdminEmail(),
            contactData,
            '/views/contact.ejs'
        ).catch(err => console.error('Admin contact email failure:', err));

        // Send confirmation email to customer (non-blocking)
        sendEmail(
            'Thank You for Contacting Easy Jackets',
            req.body.email,
            contactData,
            '/views/contactCustomer.ejs'
        ).catch(err => console.error('Customer contact email failure:', err));

        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error in contact submission:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
};

// Newsletter Subscription
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }

        // Saved to the admin's People -> Subscribers list. Someone already on the list is told so
        // and gets no second pair of emails; a former subscriber is switched back on.
        const address = email.trim().toLowerCase();
        const existing = await NewsletterSubscriber.findOne({ email: address });
        if (existing && existing.status === 'subscribed') {
            return res.status(200).json({ success: true, alreadySubscribed: true, message: "You're already on the list. Thanks!" });
        }
        try {
            if (existing) {
                await NewsletterSubscriber.updateOne({ _id: existing._id }, { $set: { status: 'subscribed', subscribedAt: new Date(), unsubscribedAt: null } });
            } else {
                await NewsletterSubscriber.create({ email: address, source: 'Website footer' });
            }
        } catch (error) {
            if (error?.code === 11000) return res.status(200).json({ success: true, alreadySubscribed: true, message: "You're already on the list. Thanks!" });
            throw error;
        }

        const subscriptionData = {
            email: email.trim(),
            date: new Date().toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
            }),
            siteUrl: (process.env.CLIENT_URL || '').replace(/\/+$/, ''),
        };

        // Both emails are awaited (they used to be fired and forgotten, so a failure was
        // invisible): the team is told, the subscriber gets the welcome email.
        const adminRecipient = await getAdminEmail();
        const [adminEmail, customerEmail] = await Promise.allSettled([
            adminRecipient
                ? sendEmail(`New newsletter subscriber: ${subscriptionData.email}`, adminRecipient, subscriptionData, '/views/subscriptionAdmin.ejs', { replyTo: subscriptionData.email })
                : Promise.reject(new Error('no admin email is set (Settings -> Email Configuration -> Notifications go to)')),
            sendEmail('Welcome to Easy Jackets: you\'re on the list', subscriptionData.email, subscriptionData, '/views/subscriptionCustomer.ejs'),
        ]);
        const outcome = (r) => (r.status === 'fulfilled' ? (r.value?.skipped ? 'skipped (sending is off)' : 'sent') : 'failed');
        if (adminEmail.status === 'rejected') console.error('Newsletter admin email failed:', adminEmail.reason?.message || adminEmail.reason);
        if (customerEmail.status === 'rejected') console.error('Newsletter welcome email failed:', customerEmail.reason?.message || customerEmail.reason);
        console.log(`✉️  Newsletter signup ${subscriptionData.email}: team email ${outcome(adminEmail)}, welcome email ${outcome(customerEmail)}`);

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            emailStatus: { admin: outcome(adminEmail), subscriber: outcome(customerEmail) },
        });
    } catch (error) {
        console.error('Error in newsletter subscription:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again.' });
    }
};
