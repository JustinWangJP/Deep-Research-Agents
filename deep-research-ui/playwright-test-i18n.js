import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testI18nUI() {
  const browser = await chromium.launch({ 
    headless: false, // ブラウザを表示してテスト
    slowMo: 1000 // 動作をゆっくりにして確認しやすくする
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 i18n E2Eテストを開始します...');
    
    // アプリケーションにアクセス
    await page.goto('http://localhost:5174/');
    console.log('✅ アプリケーションにアクセスしました');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    console.log('✅ ページの読み込みが完了しました');
    
    // 初期言語の確認（デフォルトは英語または日本語）
    console.log('\n🌐 初期言語設定の確認...');
    const title = await page.locator('header h1').textContent();
    console.log(`📝 アプリタイトル: ${title}`);
    
    // 言語切り替えボタンの確認
    console.log('\n🔄 言語切り替え機能のテスト...');
    const languageSwitcher = await page.locator('[data-testid="language-switcher"], .language-switcher, button:has-text("EN"), button:has-text("JA")').first();
    
    if (await languageSwitcher.isVisible()) {
      console.log('✅ 言語切り替えボタンが表示されています');
      
      // 現在の言語を確認
      const currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng') || 'en');
      console.log(`📍 現在の言語: ${currentLang}`);
      
      // 言語を切り替え
      await languageSwitcher.click();
      await page.waitForTimeout(2000); // 翻訳の適用を待機
      
      // 切り替え後の言語を確認
      const newLang = await page.evaluate(() => localStorage.getItem('i18nextLng') || 'en');
      console.log(`🔄 切り替え後の言語: ${newLang}`);
      
      // タイトルが変更されたか確認
      const newTitle = await page.locator('header h1').textContent();
      console.log(`📝 切り替え後のタイトル: ${newTitle}`);
      
      if (title !== newTitle) {
        console.log('✅ 言語切り替えが正常に動作しています');
      } else {
        console.log('⚠️  タイトルが変更されていません（同じ言語の可能性）');
      }
      
      // 言語切り替え後のスクリーンショット
      await page.screenshot({ 
        path: `screenshots/i18n-${newLang}-header.png`,
        fullPage: true 
      });
      console.log(`📸 ${newLang}言語でのヘッダーのスクリーンショットを保存しました`);
      
    } else {
      console.log('❌ 言語切り替えボタンが見つかりません');
    }
    
    // ナビゲーション要素の翻訳確認
    console.log('\n📑 ナビゲーション要素の翻訳確認...');
    const navItems = ['Dashboard', 'Agents', 'Search', 'Memory', 'Citations', 'ダッシュボード', 'エージェント', '検索', 'メモリ', '引用'];
    
    for (const item of navItems) {
      const navElement = await page.locator(`button:has-text("${item}"), a:has-text("${item}"), [role="tab"]:has-text("${item}")`).first();
      if (await navElement.isVisible()) {
        console.log(`✅ ナビゲーション項目「${item}」が表示されています`);
      }
    }
    
    // 各タブでの翻訳確認
    console.log('\n🔍 各タブでの翻訳内容確認...');
    const tabs = [
      { id: 'agents', enText: 'Agents', jaText: 'エージェント' },
      { id: 'search', enText: 'Search', jaText: '検索' },
      { id: 'memory', enText: 'Memory', jaText: 'メモリ' },
      { id: 'citations', enText: 'Citations', jaText: '引用' }
    ];
    
    for (const tab of tabs) {
      // タブをクリック
      const tabButton = await page.locator(`button:has-text("${tab.enText}"), button:has-text("${tab.jaText}")`).first();
      
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(2000); // コンテンツの読み込みを待機
        
        console.log(`📋 ${tab.id}タブの翻訳確認中...`);
        
        // タブ固有の翻訳要素を確認
        await checkTabTranslations(page, tab.id);
        
        // タブのスクリーンショット
        const currentLang = await page.evaluate(() => localStorage.getItem('i18nextLng') || 'en');
        await page.screenshot({ 
          path: `screenshots/i18n-${currentLang}-${tab.id}.png`,
          fullPage: true 
        });
        console.log(`📸 ${tab.id}タブ（${currentLang}）のスクリーンショットを保存しました`);
      }
    }
    
    // ステータス表示の翻訳確認
    console.log('\n🔄 ステータス表示の翻訳確認...');
    await checkStatusTranslations(page);
    
    // エラーメッセージの翻訳確認（可能な場合）
    console.log('\n❌ エラーメッセージの翻訳確認...');
    await checkErrorTranslations(page);
    
    // 数値・日時フォーマットの確認
    console.log('\n🔢 数値・日時フォーマットの確認...');
    await checkNumberDateFormats(page);
    
    // 両言語での完全テスト
    console.log('\n🌍 両言語での完全テスト...');
    await testBothLanguages(page);
    
    console.log('\n🎉 i18n E2Eテストが完了しました！');
    console.log('📁 スクリーンショットは screenshots/ フォルダに保存されました');
    
  } catch (error) {
    console.error('❌ i18nテスト中にエラーが発生しました:', error);
  } finally {
    // ブラウザを閉じる前に少し待機
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

// タブ固有の翻訳要素をチェックする関数
async function checkTabTranslations(page, tabId) {
  switch (tabId) {
    case 'agents':
      // エージェント管理の翻訳確認
      const agentElements = [
        'Total Agents', '総エージェント数',
        'Active Agents', '稼働中エージェント',
        'Running', '実行中',
        'Completed', '完了',
        'Error', 'エラー',
        'Idle', '待機中'
      ];
      
      for (const element of agentElements) {
        const found = await page.locator(`text="${element}"`).first();
        if (await found.isVisible()) {
          console.log(`  ✅ エージェント要素「${element}」が表示されています`);
        }
      }
      break;
      
    case 'search':
      // 検索インターフェースの翻訳確認
      const searchElements = [
        'Search', '検索',
        'Query', 'クエリ',
        'Results', '結果',
        'Provider', 'プロバイダー'
      ];
      
      for (const element of searchElements) {
        const found = await page.locator(`text="${element}"`).first();
        if (await found.isVisible()) {
          console.log(`  ✅ 検索要素「${element}」が表示されています`);
        }
      }
      break;
      
    case 'memory':
      // メモリ管理の翻訳確認
      const memoryElements = [
        'Memory', 'メモリ',
        'Entries', 'エントリ',
        'Type', 'タイプ',
        'Source', 'ソース'
      ];
      
      for (const element of memoryElements) {
        const found = await page.locator(`text="${element}"`).first();
        if (await found.isVisible()) {
          console.log(`  ✅ メモリ要素「${element}」が表示されています`);
        }
      }
      break;
      
    case 'citations':
      // 引用管理の翻訳確認
      const citationElements = [
        'Citations', '引用',
        'Source', 'ソース',
        'Content', 'コンテンツ',
        'Confidence', '信頼度'
      ];
      
      for (const element of citationElements) {
        const found = await page.locator(`text="${element}"`).first();
        if (await found.isVisible()) {
          console.log(`  ✅ 引用要素「${element}」が表示されています`);
        }
      }
      break;
  }
}

// ステータス表示の翻訳確認
async function checkStatusTranslations(page) {
  const statusElements = [
    { en: 'Running', ja: '実行中' },
    { en: 'Completed', ja: '完了' },
    { en: 'Error', ja: 'エラー' },
    { en: 'Idle', ja: '待機中' }
  ];
  
  for (const status of statusElements) {
    const enElement = await page.locator(`text="${status.en}"`).first();
    const jaElement = await page.locator(`text="${status.ja}"`).first();
    
    if (await enElement.isVisible() || await jaElement.isVisible()) {
      console.log(`  ✅ ステータス「${status.en}/${status.ja}」の翻訳が確認できました`);
    }
  }
}

// エラーメッセージの翻訳確認
async function checkErrorTranslations(page) {
  // 意図的にエラーを発生させるのは危険なので、
  // エラー要素が存在するかどうかのみチェック
  const errorElements = [
    'Error', 'エラー',
    'Loading', '読み込み中',
    'Failed', '失敗'
  ];
  
  for (const element of errorElements) {
    const found = await page.locator(`text="${element}"`).first();
    if (await found.isVisible()) {
      console.log(`  ✅ エラー関連要素「${element}」が表示されています`);
    }
  }
}

// 数値・日時フォーマットの確認
async function checkNumberDateFormats(page) {
  // 数値が表示されている要素を探す
  const numberElements = await page.locator('text=/\\d+/').all();
  
  if (numberElements.length > 0) {
    console.log(`  📊 ${numberElements.length}個の数値要素が見つかりました`);
    
    // 最初の数値要素の内容を確認
    const firstNumber = await numberElements[0].textContent();
    console.log(`  🔢 数値例: ${firstNumber}`);
  }
  
  // 日時が表示されている要素を探す
  const dateElements = await page.locator('text=/\\d{4}-\\d{2}-\\d{2}|\\d{1,2}:\\d{2}/').all();
  
  if (dateElements.length > 0) {
    console.log(`  📅 ${dateElements.length}個の日時要素が見つかりました`);
    
    // 最初の日時要素の内容を確認
    const firstDate = await dateElements[0].textContent();
    console.log(`  🕒 日時例: ${firstDate}`);
  }
}

// 両言語での完全テスト
async function testBothLanguages(page) {
  const languages = ['en', 'ja'];
  
  for (const lang of languages) {
    console.log(`\n🌐 ${lang.toUpperCase()}言語でのテスト開始...`);
    
    // 言語を設定
    await page.evaluate((language) => {
      localStorage.setItem('i18nextLng', language);
    }, lang);
    
    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // ヘッダーの確認
    const title = await page.locator('header h1').textContent();
    const subtitle = await page.locator('header p').textContent();
    
    console.log(`  📝 タイトル: ${title}`);
    console.log(`  📝 サブタイトル: ${subtitle}`);
    
    // システムステータスの確認
    const systemStatus = await page.locator('text=/System Online|システム稼働中/').first();
    if (await systemStatus.isVisible()) {
      const statusText = await systemStatus.textContent();
      console.log(`  🟢 システムステータス: ${statusText}`);
    }
    
    // 全体のスクリーンショット
    await page.screenshot({ 
      path: `screenshots/i18n-complete-${lang}.png`,
      fullPage: true 
    });
    console.log(`  📸 ${lang}言語の完全スクリーンショットを保存しました`);
  }
}

// screenshotsディレクトリを作成
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// i18nテストを実行
testI18nUI();