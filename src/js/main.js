// Display news grid
function displayNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    if (!news || news.length === 0) {
        newsGrid.innerHTML = '<div class="loading">No news available</div>';
        return;
    }

    newsGrid.innerHTML = news.map(item => `
        <article class="news-card">
            <div class="news-card-content">
                <div class="news-card-meta">
                    <span class="impact-badge ${item.impact?.toLowerCase()}">${item.impact || 'Unknown'}</span>
                    <span>${new Date(item.publishDate).toLocaleDateString()}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.summary || 'Click to read more...'}</p>
                <div class="news-card-footer">
                    <a href="${item.originalUrl}" target="_blank" rel="noopener noreferrer" class="read-more">Read Original →</a>
                    ${item.affiliateId ? 
                        '<span class="affiliate-tag">📘 SPONSORED</span>' : 
                        ''}
                </div>
            </div>
        </article>
    `).join('');
}