export interface GenerateHTMLParams {
    title: string;
    description: string;
    imageUrls: string[];
}

export function generateFlyerHTML(params: GenerateHTMLParams): string {
    const { title, description, imageUrls } = params;

    return `
    <div class="flyer-container">
      <header class="flyer-header">
        <h1>${escapeHtml(title)}</h1>
      </header>

      ${imageUrls.length > 0 ? `
        <div class="flyer-images">
          ${imageUrls.map((url, index) => `
            <img
              src="${escapeHtml(url)}"
              alt="${escapeHtml(title)} - 이미지 ${index + 1}"
              class="flyer-image"
            />
          `).join('')}
        </div>
      ` : ''}

      ${description ? `
        <div class="flyer-description">
          <p>${escapeHtml(description)}</p>
        </div>
      ` : ''}
    </div>
  `.trim();
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// HTML에서 이미지 URL 추출 (수정 시 사용)
export function extractImageUrls(html: string): string[] {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        urls.push(match[1]);
    }

    return urls;
}
