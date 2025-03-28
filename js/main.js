// 存儲當前的正則表達式列表
let currentRegexList = [];
let allExpanded = false;

// 在頁面加載時填入預設值
window.onload = function () {
    const defaultRegex = '["regex:^https?://(([^/]*\\.)?storage\\.googleapis\\.com)(/.*)?$","regex:^https://(cdn\\.attn\\.tv/benq/dtag\\.js)(/.*)?$","regex:^https://(www\\.googleoptimize\\.com)(/.*)?$"]';
    document.getElementById('regexInput').value = defaultRegex;
    parseAndDisplay(); // 自動顯示預設值
};

function parseAndDisplay() {
    const inputText = document.getElementById('regexInput').value.trim();
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = '';
    currentRegexList = []; // 重置正則表達式列表

    try {
        let regexList;

        // 嘗試解析JSON
        try {
            regexList = JSON.parse(inputText);
        } catch (jsonError) {
            // 如果JSON解析失敗，嘗試作為一般陣列處理
            regexList = inputText.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '').split(',').map(item => item.trim());
        }

        if (!Array.isArray(regexList)) {
            throw new Error('輸入必須是一個陣列或逗號分隔的列表');
        }

        // 保存當前的正則表達式列表以供URL測試使用
        currentRegexList = regexList;

        // 創建控制區域
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls';

        // 添加搜索框
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = '搜尋正則表達式...';
        searchBox.className = 'search-box';
        searchBox.addEventListener('input', function () {
            filterRegexList(this.value);
        });
        controlsDiv.appendChild(searchBox);

        // 添加展開/收起全部按鈕
        const expandAllBtn = document.createElement('button');
        expandAllBtn.textContent = '展開全部';
        expandAllBtn.className = 'expand-all-btn';
        expandAllBtn.onclick = toggleExpandAll;
        controlsDiv.appendChild(expandAllBtn);

        resultsDiv.appendChild(controlsDiv);

        // 添加信息欄
        const infoBar = document.createElement('div');
        infoBar.className = 'info-bar';
        infoBar.innerHTML = `
            <span>總共 <strong>${regexList.length}</strong> 個正則表達式</span>
            <span>點擊項目可以展開/收起詳情</span>
        `;
        resultsDiv.appendChild(infoBar);

        // 創建容器
        const regexContainer = document.createElement('div');
        regexContainer.className = 'regex-container';
        regexContainer.id = 'regex-container';
        resultsDiv.appendChild(regexContainer);

        // 直接顯示所有正則表達式
        displayAllRegex();

    } catch (error) {
        resultsDiv.innerHTML = `<p class="error">錯誤: ${error.message}</p>`;
    }
}

function displayAllRegex() {
    const container = document.getElementById('regex-container');
    container.innerHTML = '';

    for (let i = 0; i < currentRegexList.length; i++) {
        const item = currentRegexList[i];
        const itemDiv = createRegexItemElement(item, i);
        container.appendChild(itemDiv);
    }
}

function createRegexItemElement(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'regex-item';
    itemDiv.id = `regex-item-${index}`;

    let regexStr = item;
    let isValidRegex = true;
    let errorMsg = '';

    // 如果項目以 "regex:" 開頭，提取實際的正則表達式
    if (typeof item === 'string' && item.startsWith('regex:')) {
        regexStr = item.substring(6); // 移除 "regex:" 前綴
    }

    // 嘗試驗證正則表達式
    try {
        new RegExp(regexStr);
    } catch (e) {
        isValidRegex = false;
        errorMsg = e.message;
    }

    // 創建header (可點擊展開/收起)
    const headerDiv = document.createElement('div');
    headerDiv.className = 'regex-header';
    headerDiv.onclick = function () {
        const content = this.nextElementSibling;
        if (content.style.display === 'block') {
            content.style.display = 'none';
            itemDiv.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            itemDiv.classList.add('expanded');
        }
    };

    // 添加索引和正則表達式模式
    const indexSpan = document.createElement('span');
    indexSpan.className = 'regex-index';
    indexSpan.textContent = `${index + 1}.`;
    headerDiv.appendChild(indexSpan);

    const patternSpan = document.createElement('span');
    patternSpan.className = 'regex-pattern';
    patternSpan.textContent = regexStr;
    headerDiv.appendChild(patternSpan);

    // 添加有效性指示
    const validSpan = document.createElement('span');
    if (isValidRegex) {
        validSpan.className = 'regex-valid';
        validSpan.textContent = '✓';
    } else {
        validSpan.className = 'regex-invalid';
        validSpan.textContent = '✗';
    }
    headerDiv.appendChild(validSpan);

    itemDiv.appendChild(headerDiv);

    // 創建內容區域 (默認隱藏)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'regex-content';

    // 原始字符串
    if (item !== regexStr) {
        const originalRegex = document.createElement('p');
        originalRegex.innerHTML = `<strong>原始字符串:</strong> ${item}`;
        contentDiv.appendChild(originalRegex);
    }

    // 提取的正則表達式
    if (typeof item === 'string' && item.startsWith('regex:')) {
        const parsedRegex = document.createElement('p');
        parsedRegex.innerHTML = `<strong>提取的正則表達式:</strong> ${regexStr}`;
        contentDiv.appendChild(parsedRegex);
    }

    // 有效性
    const validationResult = document.createElement('p');
    if (isValidRegex) {
        validationResult.innerHTML = '<strong>有效性:</strong> <span style="color: green;">有效的正則表達式</span>';
    } else {
        validationResult.innerHTML = `<strong>有效性:</strong> <span class="error">無效的正則表達式: ${errorMsg}</span>`;
    }
    contentDiv.appendChild(validationResult);

    itemDiv.appendChild(contentDiv);

    return itemDiv;
}

function filterRegexList(searchText) {
    if (!searchText) {
        displayAllRegex();
        return;
    }

    const container = document.getElementById('regex-container');
    container.innerHTML = '';

    const filteredItems = currentRegexList.filter((item, index) => {
        return item.toLowerCase().includes(searchText.toLowerCase());
    });

    if (filteredItems.length === 0) {
        container.innerHTML = '<p>沒有找到匹配的正則表達式</p>';
        return;
    }

    filteredItems.forEach((item, index) => {
        const originalIndex = currentRegexList.indexOf(item);
        const itemDiv = createRegexItemElement(item, originalIndex);
        container.appendChild(itemDiv);
    });
}

function toggleExpandAll() {
    const container = document.getElementById('regex-container');
    const items = container.getElementsByClassName('regex-item');
    const button = document.querySelector('.expand-all-btn');

    allExpanded = !allExpanded;

    for (let i = 0; i < items.length; i++) {
        const content = items[i].querySelector('.regex-content');
        if (allExpanded) {
            content.style.display = 'block';
            items[i].classList.add('expanded');
        } else {
            content.style.display = 'none';
            items[i].classList.remove('expanded');
        }
    }

    button.textContent = allExpanded ? '收起全部' : '展開全部';
}

function testUrl() {
    const url = document.getElementById('urlInput').value.trim();
    const resultsDiv = document.getElementById('urlTestResults');

    if (!url) {
        resultsDiv.innerHTML = '<p class="error">請輸入一個URL進行測試</p>';
        return;
    }

    if (currentRegexList.length === 0) {
        resultsDiv.innerHTML = '<p class="error">請先在上方輸入並顯示正則表達式列表</p>';
        return;
    }

    resultsDiv.innerHTML = '';

    // 清除先前的匹配標記
    const allItems = document.querySelectorAll('.regex-item');
    allItems.forEach(item => {
        item.classList.remove('matched');
    });

    // 創建標題
    const heading = document.createElement('h3');
    heading.textContent = 'URL測試結果';
    resultsDiv.appendChild(heading);

    // 顯示測試的URL
    const urlInfo = document.createElement('p');
    urlInfo.innerHTML = `<strong>測試URL:</strong> ${url}`;
    resultsDiv.appendChild(urlInfo);

    // 測試結果
    let matchFound = false;
    let matchedIndices = [];

    currentRegexList.forEach((item, index) => {
        let regexStr = item;

        // 如果項目以 "regex:" 開頭，提取實際的正則表達式
        if (typeof item === 'string' && item.startsWith('regex:')) {
            regexStr = item.substring(6); // 移除 "regex:" 前綴
        }

        try {
            // 處理正則表達式
            // 將字串中的雙反斜線轉換為單反斜線
            regexStr = regexStr.replace(/\\\\/g, '\\');
            const regex = new RegExp(regexStr);
            const isMatch = regex.test(url);

            if (isMatch) {
                matchFound = true;
                matchedIndices.push(index);

                // 高亮原始列表中的項目
                const originalItem = document.getElementById(`regex-item-${index}`);
                if (originalItem) {
                    originalItem.classList.add('matched');
                    
                    // 確保詳細信息中也顯示匹配結果
                    const content = originalItem.querySelector('.regex-content');
                    if (!content.querySelector('.match-result')) {
                        const matchResult = document.createElement('p');
                        matchResult.className = 'match-result';
                        matchResult.innerHTML = `<strong>匹配URL:</strong> <span style="color: green;">${url}</span>`;
                        content.appendChild(matchResult);
                    }
                }
            }
        } catch (e) {
            console.error(`正則表達式錯誤 (項目 ${index + 1}):`, e.message);
            // 無效的正則表達式，跳過
        }
    });

    // 顯示匹配結果
    const resultsSummary = document.createElement('div');
    resultsSummary.style.marginTop = '10px';

    if (matchFound) {
        resultsSummary.innerHTML = `
            <p class="success">✓ URL與 ${matchedIndices.length} 個正則表達式匹配</p>
            <p>匹配的項目: ${matchedIndices.map(i => i + 1).join(', ')}</p>
        `;
    } else {
        resultsSummary.innerHTML = '<p class="error">✗ URL與所有正則表達式都不匹配</p>';
    }

    resultsDiv.appendChild(resultsSummary);

    // 如果匹配數量很多，添加"跳轉到匹配項"按鈕
    if (matchedIndices.length > 0) {
        const jumpToMatchBtn = document.createElement('button');
        jumpToMatchBtn.textContent = '查看匹配項';
        jumpToMatchBtn.onclick = function () {
            // 直接滾動到第一個匹配項
            const firstMatchIndex = matchedIndices[0];
            const firstMatchItem = document.getElementById(`regex-item-${firstMatchIndex}`);
            if (firstMatchItem) {
                firstMatchItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 展開詳情
                const content = firstMatchItem.querySelector('.regex-content');
                content.style.display = 'block';
                firstMatchItem.classList.add('expanded');
            }
        };
        resultsDiv.appendChild(jumpToMatchBtn);
    }
}