<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #333; }
          h1 { font-size: 32px; margin-bottom: 10px; }
          p { font-size: 14px; }
          table { border-collapse: collapse; width: 100%; max-width: 1100px; margin-top: 18px; }
          th { text-align: left; border-bottom: 1px solid #333; padding: 8px; font-size: 13px; }
          td { padding: 8px; font-size: 13px; }
          tr:nth-child(even) { background: #f2f2f2; }
          a { color: #111; text-decoration: none; font-weight: 600; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>Generated for EasyJackets. This XML sitemap is meant for search engines.</p>
        <xsl:choose>
          <xsl:when test="s:sitemapindex">
            <p>This XML Sitemap Index file contains <xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemaps.</p>
            <table>
              <tr><th>Sitemap</th><th>Last Modified</th></tr>
              <xsl:for-each select="s:sitemapindex/s:sitemap">
                <tr>
                  <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                  <td><xsl:value-of select="s:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <p>This XML Sitemap file contains <xsl:value-of select="count(s:urlset/s:url)"/> URLs.</p>
            <table>
              <tr><th>URL</th><th>Last Modified</th></tr>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                  <td><xsl:value-of select="s:lastmod"/></td>
                </tr>
              </xsl:for-each>
            </table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
