import { AppleTemplateData } from '@/types/flyer';

export interface GenerateHTMLParams {
    title: string;
    description: string;
    imageUrls: string[];
}

export function generateFlyerHTML(templateId: string, formData: any): string {
    switch (templateId) {
        case 'apple':
            return generateAppleTemplateHTML(formData as AppleTemplateData);
        case 'basic':
        default:
            return generateBasicTemplateHTML(formData as GenerateHTMLParams);
    }
}

export function generateBasicTemplateHTML(params: GenerateHTMLParams): string {
    const { title, description, imageUrls } = params;

    return `
    <div class="flyer-container flyer-content">
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

export function generateAppleTemplateHTML(data: AppleTemplateData): string {
    const { juiceSale, table5kg, table10kg, contacts, varieties, orderInstruction, shippingFee, account, appleImageUrl } = data;

    const renderPriceTable = (title: string, items: typeof table5kg, headerClass: string) => `
        <div class="apple-card price-table-card">
            <div class="apple-table-header ${headerClass}">
                <div class="col-main">${title}</div>
                <div class="col-price">가격</div>
                <div class="col-count">갯수</div>
            </div>
            <div class="apple-table-body">
                ${items.map(item => `
                    <div class="apple-table-row">
                        <div class="col-main">${escapeHtml(item.range)}</div>
                        <div class="col-price">${escapeHtml(item.price)}</div>
                        <div class="col-count">${escapeHtml(item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    return `
    <div class="apple-template">
        <!-- 상단: 이미지 및 연락처/계좌번호 -->
        <div class="apple-top-grid">
            <div class="apple-card image-card">
                ${appleImageUrl ? `<img src="${escapeHtml(appleImageUrl)}" alt="사과" class="top-apple-img" />` : '<div class="no-image">사과 이미지</div>'}
            </div>
            
            <div class="contact-account-vertical">
                <div class="apple-card contact-account-card">
                    <h2 class="section-title text-red"><span>📞</span> 전화번호</h2>
                    <div class="contact-grid">
                        ${contacts.map(c => `
                            <div class="contact-box-simple">
                                <span class="contact-name">${escapeHtml(c.name)}</span>
                                <span class="contact-phone">${escapeHtml(c.phone)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="apple-card contact-account-card mt-4">
                    <h2 class="section-title text-green"><span>✅</span> 계좌번호</h2>
                    <div class="account-box-simple">
                        <div class="account-number">${escapeHtml(account.number)}</div>
                        <div class="account-details">${escapeHtml(account.bank)} - ${escapeHtml(account.owner)}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 품종, 주문 안내 및 택배비 안내 -->
        <div class="apple-info-banner mt-4">
            <p class="varieties-text">${escapeHtml(varieties)}</p>
            <p class="order-text">주문 시 <span class="text-highlight">"성함, 전화번호, 주소"</span> 보내주세요</p>
        </div>

        <div class="apple-shipping-banner">
            ${escapeHtml(shippingFee)}
        </div>

        <!-- 5KG 가격표 -->
        <div class="apple-section">
            ${renderPriceTable('과수(5KG)', table5kg, 'bg-red')}
        </div>

        <!-- 10KG 테이블 -->
        <div class="apple-bottom-section">
            ${renderPriceTable('과수(10KG)', table10kg, 'bg-green')}
        </div>

        <div class="apple-footer">
            Powered by Sium
        </div>
    </div>

    <style>
        .apple-template {
            --apple-red: #DC2626;
            --apple-green: #16A34A;
            --apple-beige: #FDFBF0;
            --apple-pink: #FFF1F1;
            --apple-light-green: #F0F9F0;
            
            background-color: var(--apple-beige);
            padding: 24px;
            font-family: sans-serif;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }

        .apple-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .apple-top-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }

        .contact-account-vertical {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .contact-account-card {
            padding: 16px;
        }

        .mt-4 { margin-top: 16px; }
        .mb-6 { margin-bottom: 24px; }

        @media (max-width: 640px) {
            .apple-top-grid {
                grid-template-columns: 1fr;
            }
        }

        .apple-table-header {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1fr;
            padding: 12px;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        .bg-red { background-color: var(--apple-red); }
        .bg-green { background-color: var(--apple-green); }

        .apple-table-row {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1fr;
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: center;
            font-size: 14px;
        }

        .apple-table-row:nth-child(even) {
            background-color: var(--apple-pink);
        }

        .apple-table-row .col-price {
            font-weight: bold;
            color: #333;
        }

        .image-card {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
            min-height: 200px;
        }

        .top-apple-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .no-image {
            color: #ccc;
            font-weight: bold;
        }

        .apple-section { margin-bottom: 24px; }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 900;
            margin-bottom: 8px;
        }
        .text-red { color: var(--apple-red); }
        .text-green { color: var(--apple-green); }

        .contact-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .contact-box-simple {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px dashed #eee;
        }

        .contact-name { font-size: 14px; font-weight: bold; color: #666; }
        .contact-phone { font-size: 16px; font-weight: 800; color: #000; }

        .account-box-simple {
            text-align: left;
        }

        .apple-info-banner {
            text-align: center;
            margin-bottom: 24px;
        }
        .varieties-text { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
        .order-text { font-size: 16px; font-weight: 700; }
        .text-highlight { color: var(--apple-red); border-bottom: 2px solid var(--apple-red); }

        .apple-shipping-banner {
            background: var(--apple-red);
            color: white;
            text-align: center;
            padding: 12px;
            font-size: 24px;
            font-weight: 900;
            border-radius: 8px;
            margin-bottom: 24px;
        }

        .apple-bottom-section {
            margin-bottom: 24px;
        }

        .account-number { font-size: 16px; font-weight: 900; margin-bottom: 2px; }
        .account-details { font-size: 12px; font-weight: 700; color: #666; }

        .apple-footer {
            margin-top: 32px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
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

