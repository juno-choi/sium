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
        <div class="apple-top-grid">
            <!-- 5KG 가격표 -->
            ${renderPriceTable('과수(5KG)', table5kg, 'bg-red')}

            <!-- 사과즙 판매 -->
            <div class="apple-card juice-card">
                <div class="juice-badge">사과즙 판매</div>
                ${juiceSale.imageUrl ? `<img src="${escapeHtml(juiceSale.imageUrl)}" alt="사과즙" class="juice-img" />` : ''}
                <div class="juice-info">
                    <div class="juice-title">${escapeHtml(juiceSale.productName)}</div>
                    <div class="juice-price">${escapeHtml(juiceSale.price)}</div>
                    <div class="juice-note">(${escapeHtml(juiceSale.shippingNote)})</div>
                </div>
            </div>
        </div>

        <!-- 전화번호 섹션 -->
        <div class="apple-section">
            <h2 class="section-title text-red"><span>📞</span> 전화번호</h2>
            <div class="contact-grid">
                ${contacts.map(c => `
                    <div class="contact-box">
                        <div class="contact-name">${escapeHtml(c.name)}</div>
                        <div class="contact-phone">${escapeHtml(c.phone)}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 품종 및 주문 안내 -->
        <div class="apple-info-banner">
            <p class="varieties-text">${escapeHtml(varieties)}</p>
            <p class="order-text">주문 시 <span class="text-highlight">"성함, 전화번호, 주소"</span> 보내주세요</p>
        </div>

        <!-- 택배비 배너 -->
        <div class="apple-shipping-banner">
            ${escapeHtml(shippingFee)}
        </div>

        <!-- 계좌번호 및 10KG 테이블 -->
        <div class="apple-bottom-grid">
            <div class="apple-section">
                <h2 class="section-title text-green"><span>✅</span> 계좌번호</h2>
                <div class="account-box">
                    <div class="account-number">${escapeHtml(account.number)}</div>
                    <div class="account-details">${escapeHtml(account.bank)} - ${escapeHtml(account.owner)}</div>
                </div>
                ${appleImageUrl ? `<img src="${escapeHtml(appleImageUrl)}" alt="사과" class="bottom-apple-img" />` : ''}
            </div>
            
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
            grid-template-columns: 3fr 2fr;
            gap: 20px;
            margin-bottom: 24px;
        }

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

        .juice-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            text-align: center;
        }

        .juice-badge {
            background: var(--apple-green);
            color: white;
            padding: 4px 12px;
            border-radius: 99px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .juice-img {
            width: 80px;
            height: auto;
            margin-bottom: 12px;
        }

        .juice-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .juice-price { font-size: 20px; font-weight: 800; color: var(--apple-red); }
        .juice-note { font-size: 12px; color: #666; }

        .apple-section { margin-bottom: 24px; }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            font-weight: 900;
            margin-bottom: 12px;
        }
        .text-red { color: var(--apple-red); }
        .text-green { color: var(--apple-green); }

        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .contact-box, .account-box {
            background: white;
            border: 2px solid #000;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
        }

        .contact-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
        .contact-phone { font-size: 18px; font-weight: 800; }

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

        .apple-bottom-grid {
            display: grid;
            grid-template-columns: 2fr 3fr;
            gap: 20px;
        }

        @media (max-width: 640px) {
            .apple-bottom-grid {
                grid-template-columns: 1fr;
            }
            .contact-grid {
                grid-template-columns: 1fr;
            }
        }

        .account-number { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
        .account-details { font-size: 14px; font-weight: 700; color: #666; }

        .bottom-apple-img {
            width: 100%;
            height: auto;
            margin-top: 16px;
            border-radius: 12px;
        }

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

