import path from "path";
import fs from 'fs';

interface ReportOptions {
    testType?: string;
    environment?: string;
    timestamp?: string;
}

interface Screenshot {
    name: string;
    path: string;
}

interface Report {
    timestamp: string;
    testType: string;
    environment: string;
    data: any;
    screenshots: Screenshot[];
    relativePath: string;
}

export function createReportDir(testType: string, environment: string) {
    // Create base reports directory
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    // Create test type directory
    const testTypeDir = path.join(reportsDir, testType);
    if (!fs.existsSync(testTypeDir)) {
        fs.mkdirSync(testTypeDir);
    }

    // Create environment directory
    const envDir = path.join(testTypeDir, environment);
    if (!fs.existsSync(envDir)) {
        fs.mkdirSync(envDir);
    }

    // Create timestamp directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(envDir, timestamp);
    fs.mkdirSync(reportDir);

    return { reportDir, timestamp };
}

export async function saveReport(page: any, reportDir: any, data: any) {
    // Save request/response data
    fs.writeFileSync(
        path.join(reportDir, 'data.json'),
        JSON.stringify(data, null, 2)
    );

    // Take screenshot
    await page.screenshot({
        path: path.join(reportDir, 'screenshot.png'),
        fullPage: true
    });
}

export function getAllReports(): Report[] {
    const reportsDir = path.join(__dirname, '../../reports');
    const reports: Report[] = [];

    // Ensure directory exists
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
        return reports;
    }

    try {
        // Get all test types (newclient, kyc)
        const testTypes = fs.readdirSync(reportsDir);
        testTypes.forEach(testType => {
            const testTypePath = path.join(reportsDir, testType);
            if (!fs.statSync(testTypePath).isDirectory()) return;

            const environments = fs.readdirSync(testTypePath);

            environments.forEach(env => {
                const envPath = path.join(testTypePath, env);
                if (!fs.statSync(envPath).isDirectory()) return;

                const timestamps = fs.readdirSync(envPath);

                timestamps.forEach(timestamp => {
                    const reportPath = path.join(envPath, timestamp);
                    const dataPath = path.join(reportPath, 'data.json');

                    if (fs.existsSync(dataPath)) {
                        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                        const screenshots = fs.readdirSync(reportPath)
                            .filter(file => file.endsWith('.png'))
                            .map(file => ({
                                name: file,
                                path: `/reports/${path.relative(reportsDir, path.join(reportPath, file))}`
                            }));

                        reports.push({
                            testType,
                            environment: env,
                            timestamp,
                            data,
                            screenshots,
                            relativePath: path.relative(reportsDir, reportPath)
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error reading reports:', error);
    }

    return reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getAllTimestamps() {
    const reportsDir = path.join(__dirname, '../../reports');
    const timestamps = new Set();

    // Get all test types (newclient, kyc)
    const testTypes = fs.readdirSync(reportsDir);

    testTypes.forEach(testType => {
        const testTypePath = path.join(reportsDir, testType);
        const environments = fs.readdirSync(testTypePath);

        environments.forEach(env => {
            const envPath = path.join(testTypePath, env);
            const reportTimestamps = fs.readdirSync(envPath);
            reportTimestamps.forEach(ts => timestamps.add(ts));
        });
    });

    return Array.from(timestamps).sort().reverse();
}

export function generateHtmlReport(reports: Report[], options: ReportOptions) {
    const { testType, environment, timestamp } = options;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>uOpen Automation Execution Reports</title>
        <style>
          html, body { 
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #f8f9fa;
            color: #333;
            display: flex;
            flex-direction: column;
          }
          .page-header {
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 100;
            flex-shrink: 0;
          }
          .filters {
            padding: 12px 20px;
            display: flex;
            gap: 12px;
            border-bottom: 1px solid #e9ecef;
          }
          .filters select {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            min-width: 200px;
            font-size: 14px;
            color: #495057;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s;
          }
          .filters select:hover {
            border-color: #adb5bd;
          }
          .filters select:focus {
            outline: none;
            border-color: #4dabf7;
            box-shadow: 0 0 0 2px rgba(77,171,247,0.2);
          }
          .reports-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px;
            height: 0; /* 强制容器使用flex布局的高度 */
          }
          .report {
            background: white;
            border: 1px solid #e9ecef;
            margin: 0 0 16px 0;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .report:hover { 
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .report h3 {
            margin: 0 0 15px 0;
            color: #1a1a1a;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .timestamp { 
            color: #868e96;
            font-size: 14px;
            font-weight: normal;
          }
          .environment {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            background: #e9ecef;
            color: #495057;
          }
          .details {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .details-header {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          }
          .details-header:hover {
            opacity: 0.8;
          }
          .details-toggle {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #495057;
            transition: transform 0.2s;
          }
          .details-toggle.expanded {
            transform: rotate(90deg);
          }
          .details-content {
            display: none;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
          }
          .details-content.expanded {
            display: block;
          }
          .details pre {
            margin: 0;
            white-space: pre-wrap;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #212529;
          }
          .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
          }
          .screenshot-container {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            overflow: hidden;
          }
          .screenshot-title {
            padding: 8px 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            font-size: 13px;
            color: #495057;
          }
          .screenshot { 
            width: 100%;
            height: auto;
            display: block;
            border: none;
            margin: 0;
            border-radius: 0;
          }
          .success { color: #40c057; }
          .error { color: #fa5252; }
  
          @media (max-width: 768px) {
            .filters {
              flex-direction: column;
              padding: 10px 15px;
            }
            .filters select {
              width: 100%;
            }
            .reports-container {
              padding: 12px 15px;
            }
            .report {
              padding: 12px;
              margin-bottom: 12px;
            }
          }
  
          /* Modal styles */
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            padding: 20px;
            overflow: hidden;
          }
          .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-content {
            position: relative;
            max-width: calc(100vw - 120px);
            max-height: calc(100vh - 120px);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .modal-image-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            overflow: hidden;
          }
          .modal-image-wrapper {
            position: relative;
            transition: transform 0.3s ease;
            cursor: grab;
          }
          .modal-image-wrapper.dragging {
            cursor: grabbing;
            transition: none;
          }
          .modal-image {
            max-width: 100%;
            max-height: calc(100vh - 200px);
            object-fit: contain;
            cursor: zoom-in;
            transition: transform 0.3s ease;
            user-select: none;
            -webkit-user-drag: none;
          }
          .modal-image.zoomed {
            cursor: grab;
          }
          .modal-image.zoomed.dragging {
            cursor: grabbing;
          }
          .modal-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.8);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
            z-index: 2;
            color: #333;
          }
          .modal-nav:hover {
            background: rgba(255, 255, 255, 0.95);
          }
          .modal-prev {
            left: 20px;
          }
          .modal-next {
            right: 20px;
          }
          .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 24px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 10px;
          }
          .modal-title {
            color: white;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            margin-bottom: 10px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            max-width: 100%;
            word-break: break-all;
          }
          .modal-footer {
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            color: white;
          }
          .modal-counter {
            font-size: 14px;
          }
          .zoom-controls {
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            background: rgba(0, 0, 0, 0.5);
            padding: 5px 10px;
            border-radius: 4px;
          }
          .zoom-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 0 5px;
          }
          .zoom-button:hover {
            opacity: 0.8;
          }
  
          .collapsible-section {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          }
          .section-header:hover {
            opacity: 0.8;
          }
          .section-toggle {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #495057;
            transition: transform 0.2s;
          }
          .section-toggle.expanded {
            transform: rotate(90deg);
          }
          .section-content {
            display: none;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
          }
          .section-content.expanded {
            display: block;
          }
  
          .report-title {
            font-size: 18px;
            font-weight: 500;
            color: #1a1a1a;
            margin: 0 0 15px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e9ecef;
          }
          .report-title .timestamp {
            color: #495057;
            font-weight: normal;
          }
          .report h3 {
            font-size: 14px;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: normal;
          }
          .tag {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            background: #e9ecef;
            color: #495057;
          }
          .tag.type {
            background: #e3f2fd;
            color: #1976d2;
          }
          .tag.env {
            background: #e8f5e9;
            color: #2e7d32;
          }
        </style>
      </head>
      <body>
        <div class="page-header">
          <div class="filters">
            <select id="testType">
              <option value="">All Test Types</option>
              <option value="newclient" ${testType === 'newclient' ? 'selected' : ''}>New Client</option>
              <option value="kyc" ${testType === 'kyc' ? 'selected' : ''}>KYC</option>
            </select>
            
            <select id="environment">
              <option value="">All Environments</option>
              <option value="DEV" ${environment === 'DEV' ? 'selected' : ''}>DEV</option>
              <option value="SIT" ${environment === 'SIT' ? 'selected' : ''}>SIT</option>
              <option value="UAT" ${environment === 'UAT' ? 'selected' : ''}>UAT</option>
            </select>
            
            <select id="timestamp">
              <option value="">All Reports</option>
              ${reports.map(report => `
                <option value="${report.timestamp}" ${timestamp === report.timestamp ? 'selected' : ''}>
                  ${report.timestamp}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
  
        <div class="reports-container">
          ${reports.map(report => `
            <div class="report">
              <div class="report-title">
                ${report.timestamp}
              </div>
              <h3>
                <span class="tag type">${report.testType}</span>
                <span class="tag env">${report.environment}</span>
              </h3>
              
              <div class="collapsible-section">
                <div class="section-header" onclick="toggleSection(this)">
                  <div class="section-toggle">›</div>
                  <span>Client Information</span>
                </div>
                <div class="section-content">
                  <pre>${JSON.stringify(report.data, null, 2)}</pre>
                </div>
              </div>
  
              ${report.screenshots.length > 0 ? `
                <div class="collapsible-section">
                  <div class="section-header" onclick="toggleSection(this)">
                    <div class="section-toggle">›</div>
                    <span>Screenshots (${report.screenshots.length})</span>
                  </div>
                  <div class="section-content">
                    <div class="screenshots" data-report-id="${report.timestamp}">
                      ${report.screenshots.map((screenshot, index) => `
                        <div class="screenshot-container" 
                             data-index="${index}"
                             onclick="openModal('${report.timestamp}', ${index})">
                          <div class="screenshot-title">${screenshot.name}</div>
                          <img class="screenshot" 
                               src="/reports/${report.relativePath}/${screenshot.name}" 
                               alt="${screenshot.name}">
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
  
        <!-- Updated modal for image preview -->
        <div class="modal" id="imageModal">
          <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-title" id="modalTitle"></div>
            <div class="modal-image-container">
              <button class="modal-nav modal-prev" onclick="changeImage(-1)">‹</button>
              <div class="modal-image-wrapper">
                <img class="modal-image" id="modalImage" src="" alt="Preview">
              </div>
              <button class="modal-nav modal-next" onclick="changeImage(1)">›</button>
            </div>
            <div class="modal-footer">
              <div class="modal-counter" id="imageCounter"></div>
            </div>
            <div class="zoom-controls">
              <button class="zoom-button" onclick="zoomImage(-1)">−</button>
              <button class="zoom-button" onclick="zoomImage(1)">+</button>
            </div>
          </div>
        </div>
  
        <script>
          function updateFilters() {
            const testType = document.getElementById('testType').value;
            const environment = document.getElementById('environment').value;
            const timestamp = document.getElementById('timestamp').value;
            
            const params = new URLSearchParams();
            if (testType) params.append('testType', testType);
            if (environment) params.append('environment', environment);
            if (timestamp) params.append('timestamp', timestamp);
            
            window.location.href = '/api/reports/html?' + params.toString();
          }
  
          document.getElementById('testType').addEventListener('change', updateFilters);
          document.getElementById('environment').addEventListener('change', updateFilters);
          document.getElementById('timestamp').addEventListener('change', updateFilters);
  
          let currentReportId = '';
          let currentImageIndex = 0;
          let currentImages = [];
          let currentImageNames = [];
          let currentZoomLevel = 1;
          let isDragging = false;
          let hasMoved = false;
          let startX = 0;
          let startY = 0;
          let translateX = 0;
          let translateY = 0;
          let lastTranslateX = 0;
          let lastTranslateY = 0;
  
          function startDrag(e) {
            const modalImage = document.getElementById('modalImage');
            if (!modalImage.classList.contains('zoomed')) return;
  
            isDragging = true;
            hasMoved = false;
            startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            
            modalImage.classList.add('dragging');
  
            // Store current translation
            const transform = modalImage.style.transform;
            const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
            if (match) {
              lastTranslateX = parseFloat(match[1]);
              lastTranslateY = parseFloat(match[2]);
            }
          }
  
          function doDrag(e) {
            if (!isDragging) return;
            e.preventDefault();
  
            const modalImage = document.getElementById('modalImage');
            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            
            const moveX = Math.abs(currentX - startX);
            const moveY = Math.abs(currentY - startY);
            if (moveX > 5 || moveY > 5) {
              hasMoved = true;
            }
  
            translateX = lastTranslateX + (currentX - startX);
            translateY = lastTranslateY + (currentY - startY);
  
            // Calculate bounds
            const rect = modalImage.getBoundingClientRect();
            const scaledWidth = rect.width * currentZoomLevel;
            const scaledHeight = rect.height * currentZoomLevel;
            const maxX = (scaledWidth - rect.width) / 2;
            const maxY = (scaledHeight - rect.height) / 2;
  
            // Limit translation within bounds
            translateX = Math.max(-maxX, Math.min(maxX, translateX));
            translateY = Math.max(-maxY, Math.min(maxY, translateY));
  
            modalImage.style.transform = 
              \`scale(\${currentZoomLevel}) translate(\${translateX}px, \${translateY}px)\`;
          }
  
          function endDrag(e) {
            if (!isDragging) return;
            
            isDragging = false;
            const modalImage = document.getElementById('modalImage');
            modalImage.classList.remove('dragging');
            
            lastTranslateX = translateX;
            lastTranslateY = translateY;
          }
  
          function resetImagePosition() {
            translateX = 0;
            translateY = 0;
            lastTranslateX = 0;
            lastTranslateY = 0;
            const modalImage = document.getElementById('modalImage');
            modalImage.style.transform = \`scale(\${currentZoomLevel})\`;
          }
  
          function zoomImage(delta) {
            const modalImage = document.getElementById('modalImage');
            const newZoom = Math.max(1, Math.min(3, currentZoomLevel + delta * 0.5));
            
            if (newZoom !== currentZoomLevel) {
              currentZoomLevel = newZoom;
              resetImagePosition();
              modalImage.classList.toggle('zoomed', currentZoomLevel > 1);
            }
          }
  
          function openModal(reportId, index) {
            const modal = document.getElementById('imageModal');
            currentReportId = reportId;
            currentImageIndex = index;
            currentZoomLevel = 1;
            resetImagePosition();
            
            const screenshots = document.querySelector(\`.screenshots[data-report-id="\${reportId}"]\`);
            const screenshotContainers = screenshots.querySelectorAll('.screenshot-container');
            
            currentImages = Array.from(screenshotContainers).map(container => 
              container.querySelector('.screenshot').src
            );
            currentImageNames = Array.from(screenshotContainers).map(container => 
              container.querySelector('.screenshot-title').textContent
            );
            
            updateModalImage();
            modal.classList.add('active');
  
            // Add drag event listeners
            const modalImage = document.getElementById('modalImage');
            modalImage.removeEventListener('click', handleImageClick);
            modalImage.addEventListener('click', handleImageClick);
            
            modalImage.addEventListener('mousedown', startDrag);
            modalImage.addEventListener('touchstart', startDrag);
            
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('touchmove', doDrag, { passive: false });
            
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchend', endDrag);
          }
  
          function closeModal() {
            const modal = document.getElementById('imageModal');
            modal.classList.remove('active');
            
            // Remove all event listeners
            const modalImage = document.getElementById('modalImage');
            modalImage.removeEventListener('click', handleImageClick);
            modalImage.removeEventListener('mousedown', startDrag);
            modalImage.removeEventListener('touchstart', startDrag);
            
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('touchmove', doDrag);
            
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
          }
  
          function updateModalImage() {
            const modalImage = document.getElementById('modalImage');
            const modalTitle = document.getElementById('modalTitle');
            const counter = document.getElementById('imageCounter');
            
            modalImage.style.transform = \`scale(\${currentZoomLevel})\`;
            modalImage.src = currentImages[currentImageIndex];
            modalTitle.textContent = currentImageNames[currentImageIndex];
            counter.textContent = \`\${currentImageIndex + 1} / \${currentImages.length}\`;
            
            document.querySelector('.modal-prev').style.display = 
              currentImageIndex > 0 ? 'flex' : 'none';
            document.querySelector('.modal-next').style.display = 
              currentImageIndex < currentImages.length - 1 ? 'flex' : 'none';
          }
  
          function changeImage(delta) {
            const oldIndex = currentImageIndex;
            currentImageIndex = Math.max(0, Math.min(currentImages.length - 1, currentImageIndex + delta));
            currentZoomLevel = 1;
            
            const wrapper = document.querySelector('.modal-image-wrapper');
            wrapper.style.transform = \`translateX(\${-100 * (oldIndex - currentImageIndex)}%)\`;
            
            setTimeout(() => {
              wrapper.style.transition = 'none';
              wrapper.style.transform = '';
              updateModalImage();
              setTimeout(() => {
                wrapper.style.transition = 'transform 0.3s ease';
              }, 50);
            }, 300);
          }
  
          // Handle image click for zoom toggle
          function handleImageClick(e) {
            if (!hasMoved) {
              zoomImage(this.classList.contains('zoomed') ? -10 : 1);
            }
          }
  
          // Handle keyboard events
          document.addEventListener('keydown', function(e) {
            if (document.querySelector('.modal.active')) {
              if (e.key === 'Escape') closeModal();
              if (e.key === 'ArrowLeft') changeImage(-1);
              if (e.key === 'ArrowRight') changeImage(1);
              if (e.key === '+' || e.key === '=') zoomImage(1);
              if (e.key === '-') zoomImage(-1);
            }
          });
  
          // Handle mouse wheel for zoom
          document.querySelector('.modal-image-container').addEventListener('wheel', function(e) {
            if (e.ctrlKey) {
              e.preventDefault();
              zoomImage(e.deltaY > 0 ? -1 : 1);
            }
          });
  
          function toggleSection(header) {
            const content = header.nextElementSibling;
            const toggle = header.querySelector('.section-toggle');
            
            content.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
          }
        </script>
      </body>
      </html>
    `;

    return html;
}