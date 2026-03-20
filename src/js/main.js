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

    // Update live data from Notion (if on homepage)
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        fetchNews();
    }
});

// Function to fetch news from Notion API
async function fetchNews() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.stats);
            displayNews(data.news);
            updateTicker(data);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
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
                    <span>${new Date(item.publishDate).toLocaleDateString()}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.summary || 'Click to read more...'}</p>
                <div class="news-card-footer">
                    <a href="/article/${item.slug}" class="read-more">Read More</a>
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
    // Try to get by ID first (your new setup), fallback to class (old setup)
    const ticker = document.getElementById('dynamic-ticker') || document.querySelector('.ticker');
    if (!ticker) return;

    // Get the latest breaking headline
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
    
    ticker.innerHTML = items.map(item => 
        `<div class="ticker__item">${item}</div>`
    ).join('');
}

// Helper function for affiliate clicks
function handleAffiliateClick(productId, price) {
    console.log(`Affiliate click: ${productId} - $${price}`);
    // Add analytics tracking here if needed
}