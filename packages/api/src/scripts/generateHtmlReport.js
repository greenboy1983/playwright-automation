function generateHtmlReport(reports, { testType, environment, timestamp }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>uOpen Automation Execution Reports</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f8f9fa;
          color: #333;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .page-header {
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 100;
          flex-shrink: 0;
        }
        .filters {
          padding: 15px 20px;
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
          padding: 20px;
        }
        .report {
          background: white;
          border: 1px solid #e9ecef;
          margin: 0 0 20px 0;
          padding: 20px;
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
          margin: 15px 0;
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
            padding: 12px 15px;
          }
          .filters select {
            width: 100%;
          }
          .reports-container {
            padding: 20px 15px;
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
        }
        .modal.active {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-image-container {
          position: relative;
        }
        .modal-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
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
        .modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .modal-nav:hover {
          background: rgba(255, 255, 255, 0.95);
        }
        .modal-prev {
          left: -60px;
        }
        .modal-next {
          right: -60px;
        }
        .screenshot-container {
          cursor: pointer;
        }
        .screenshot-container:hover {
          opacity: 0.9;
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
            <h3>
              ${report.testType} 
              <span class="environment">${report.environment}</span>
              <span class="timestamp">${report.timestamp}</span>
            </h3>
            <div class="details">
              <pre>${JSON.stringify(report.data, null, 2)}</pre>
            </div>
            ${report.screenshots.length > 0 ? `
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
            <img class="modal-image" id="modalImage" src="" alt="Preview">
            <button class="modal-nav modal-next" onclick="changeImage(1)">›</button>
          </div>
          <div class="modal-footer">
            <div class="modal-counter" id="imageCounter"></div>
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

        function openModal(reportId, index) {
          const modal = document.getElementById('imageModal');
          const modalImage = document.getElementById('modalImage');
          const screenshots = document.querySelector(\`.screenshots[data-report-id="\${reportId}"]\`);
          
          currentReportId = reportId;
          currentImageIndex = index;
          
          // Get both image sources and names
          const screenshotContainers = screenshots.querySelectorAll('.screenshot-container');
          currentImages = Array.from(screenshotContainers).map(container => 
            container.querySelector('.screenshot').src
          );
          currentImageNames = Array.from(screenshotContainers).map(container => 
            container.querySelector('.screenshot-title').textContent
          );
          
          updateModalImage();
          modal.classList.add('active');
        }

        function closeModal() {
          const modal = document.getElementById('imageModal');
          modal.classList.remove('active');
        }

        function updateModalImage() {
          const modalImage = document.getElementById('modalImage');
          const modalTitle = document.getElementById('modalTitle');
          const counter = document.getElementById('imageCounter');
          
          modalImage.src = currentImages[currentImageIndex];
          modalTitle.textContent = currentImageNames[currentImageIndex];
          counter.textContent = \`\${currentImageIndex + 1} / \${currentImages.length}\`;
          
          // Update navigation buttons visibility
          document.querySelector('.modal-prev').style.display = currentImageIndex > 0 ? 'flex' : 'none';
          document.querySelector('.modal-next').style.display = 
            currentImageIndex < currentImages.length - 1 ? 'flex' : 'none';
        }

        function changeImage(delta) {
          currentImageIndex = Math.max(0, Math.min(currentImages.length - 1, currentImageIndex + delta));
          updateModalImage();
        }

        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeModal();
          if (e.key === 'ArrowLeft') changeImage(-1);
          if (e.key === 'ArrowRight') changeImage(1);
        });
      </script>
    </body>
    </html>
  `;

  return html;
}

module.exports = generateHtmlReport; 