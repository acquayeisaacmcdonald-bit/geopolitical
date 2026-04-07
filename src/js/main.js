// Main JavaScript for Geopolitical Command Center

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            }
        });
    }

    // Mobile menu toggle (if needed)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Function to fetch news from Notion API
async function fetchNews() {
    console.log('fetchNews called');
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
            updateStats(data.stats);
            displayNews(data.news);
            updateTicker(data);
        } else {
            console.error('API returned error:', data);
            const newsGrid = document.getElementById('newsGrid');
            if (newsGrid) {
                newsGrid.innerHTML = '<div class="loading">Error loading news</div>';
            }
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = '<div class="loading">Error connecting to server</div>';
        }
    }
}

// Update statistics bar
function updateStats(stats) {
    const oilPrice = document.getElementById('oilPrice');
    const casualties = document.getElementById('casualties');
    const impactLevel = document.getElementById('impactLevel');
    const updateCount = document.getElementById('updateCount');

    if (oilPrice) oilPrice.textContent = `$${stats.averageOilPrice?.toFixed(2) || '89.50'}`;
    if (casualties) casualties.textContent = stats.totalCasualties?.toLocaleString() || '12,847';
    if (impactLevel) impactLevel.textContent = stats.catastrophicCount > 0 ? 'CATASTROPHIC' : 'ELEVATED';
    if (updateCount) updateCount.textContent = stats.totalArticles || '47';
}

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
                    <span>${item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'Recent'}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.summary || 'Click to read more...')}</p>
                <div class="news-card-footer">
                    <a href="${item.originalUrl || '#'}" target="_blank" rel="noopener noreferrer" class="read-more">Read Original →</a>
                    ${item.affiliateId ? 
                        '<span class="affiliate-tag">📘 SPONSORED</span>' : 
                        ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Update ticker
function updateTicker(data) {
    const ticker = document.getElementById('dynamic-ticker') || document.querySelector('.ticker');
    if (!ticker) return;

    const breakingHeadline = data.news?.[0]?.title || 'Iran-Israel War Update';
    const oilPrice = data.stats?.averageOilPrice?.toFixed(2) || '112';
    const casualties = data.stats?.totalCasualties?.toLocaleString() || '13,000';
    const catastrophicCount = data.stats?.catastrophicCount || 0;

    const items = [
        `🚨 BREAKING: ${breakingHeadline}`,
        `🛢️ OIL: $${oilPrice}`,
        `⚔️ CASUALTIES: ${casualties} confirmed`,
        `🌍 CATASTROPHIC EVENTS: ${catastrophicCount}`,
        `📡 LIVE: Latest developments`
    ];
    
    ticker.innerHTML = items.map(item => `<div class="ticker__item">${item}</div>`).join('');
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Helper function for affiliate clicks
function handleAffiliateClick(productId, price) {
    console.log(`Affiliate click: ${productId} - $${price}`);
}

// Auto-fetch news when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchNews);
} else {
    fetchNews();
}