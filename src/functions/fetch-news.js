const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY
    });

    const databaseId = "31f4218fc5ae80459902e0d2446da025";

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: {
          equals: 'live'
        }
      },
      sorts: [
        {
          property: 'Publish Date',
          direction: 'descending'
        }
      ],
      page_size: 20
    });

    const newsItems = response.results.map(page => {
      const getText = (prop) => {
        if (!prop) return '';
        if (prop.title) return prop.title[0]?.plain_text || '';
        if (prop.rich_text) return prop.rich_text[0]?.plain_text || '';
        return '';
      };

      const getSelect = (prop) => {
        return prop?.select?.name || '';
      };

      const getNumber = (prop) => {
        return prop?.number || null;
      };

      const getUrl = (prop) => {
        if (!prop) return null;
        return prop.url || null;
      };

      const title = getText(page.properties.Name);
      
      // Create clean slug from title
      const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      return {
        title: title,
        slug: cleanSlug,
        impact: getSelect(page.properties['Global Impact Level']),
        oilPrice: getNumber(page.properties['Oil Price Tracker']),
        affiliateId: getText(page.properties['Affiliate Link ID']),
        casualties: getNumber(page.properties['Casualty Count (Est.)']),
        publishDate: page.properties['Publish Date']?.date?.start || null,
        originalUrl: getUrl(page.properties['Original URL'])  // ← Space is correct
      };
    });

    const stats = {
      totalArticles: newsItems.length,
      catastrophicCount: newsItems.filter(item => item.impact === 'Catastrophic').length,
      averageOilPrice: newsItems.reduce((acc, item) => acc + (item.oilPrice || 0), 0) / newsItems.length || 0,
      totalCasualties: newsItems.reduce((acc, item) => acc + (item.casualties || 0), 0)
    };

    res.status(200).json({
      success: true,
      news: newsItems,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};