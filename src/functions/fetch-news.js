const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
  // Allow anyone to access this API
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Connect to Notion
    const notion = new Client({ 
      auth: process.env.NOTION_API_KEY 
    });

    // IMPORTANT: You'll replace this with your actual database ID
    const databaseId = "3194218f-c5ae-8054-8a11-f77a5d743e4b"

    // Get data from Notion
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: {
          equals: 'Live'
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

    // Format the data nicely
    const newsItems = response.results.map(page => {
      // Helper to get text safely
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

      return {
        title: getText(page.properties.Name),
        slug: getText(page.properties.Slug),
        impact: getSelect(page.properties['Global Impact Level']),
        oilPrice: getNumber(page.properties['Oil Price Tracker']),
        affiliateId: getText(page.properties['Affiliate Link ID']),
        casualties: getNumber(page.properties['Casualty Count (Est.)']),
        publishDate: page.properties['Publish Date']?.date?.start || null,
      };
    });

    // Calculate some stats
    const stats = {
      totalArticles: newsItems.length,
      catastrophicCount: newsItems.filter(item => item.impact === 'Catastrophic').length,
      averageOilPrice: newsItems.reduce((acc, item) => acc + (item.oilPrice || 0), 0) / newsItems.length || 0,
      totalCasualties: newsItems.reduce((acc, item) => acc + (item.casualties || 0), 0)
    };

    // Send back the data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        news: newsItems,
        stats,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    // If something goes wrong
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};