import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testUI() {
  const browser = await chromium.launch({ 
    headless: false, // ブラウザを表示してテスト
    slowMo: 1000 // 動作をゆっくりにして確認しやすくする
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 ブラウザを起動中...');
    
    // アプリケーションにアクセス
    await page.goto('http://localhost:5174/');
    console.log('✅ アプリケーションにアクセスしました');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    console.log('✅ ページの読み込みが完了しました');
    
    // スクリーンショットを撮影
    await page.screenshot({ 
      path: 'screenshots/initial-load.png',
      fullPage: true 
    });
    console.log('📸 初期画面のスクリーンショットを保存しました');
    
    // ヘッダーの確認
    console.log('\n🔍 ヘッダーの確認中...');
    const header = await page.locator('header');
    await header.waitFor({ state: 'visible' });
    
    // ロゴとタイトルの確認
    const logo = await page.locator('header .w-8.h-8');
    const title = await page.locator('header h1');
    
    if (await logo.isVisible()) {
      console.log('✅ ロゴが表示されています');
    } else {
      console.log('❌ ロゴが表示されていません');
    }
    
    if (await title.isVisible()) {
      console.log('✅ タイトルが表示されています');
    } else {
      console.log('❌ タイトルが表示されていません');
    }
    
    // ダークモードトグルボタンの確認
    console.log('\n🌙 ダークモード機能のテスト...');
    const darkModeButton = await page.locator('button[aria-label="Toggle dark mode"]');
    
    if (await darkModeButton.isVisible()) {
      console.log('✅ ダークモードトグルボタンが表示されています');
      
      // ダークモードに切り替え
      await darkModeButton.click();
      await page.waitForTimeout(1000);
      
      // ダークモード時のスクリーンショット
      await page.screenshot({ 
        path: 'screenshots/dark-mode.png',
        fullPage: true 
      });
      console.log('📸 ダークモードのスクリーンショットを保存しました');
      
      // ライトモードに戻す
      await darkModeButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ ダークモードトグルボタンが表示されていません');
    }
    
    // タブナビゲーションの確認
    console.log('\n📑 タブナビゲーションのテスト...');
    const tabs = ['agents', 'search', 'memory', 'citations'];
    
    for (const tabId of tabs) {
      const tabButton = await page.locator(`button:has-text("${tabId.charAt(0).toUpperCase() + tabId.slice(1)}")`);
      
      if (await tabButton.isVisible()) {
        console.log(`✅ ${tabId}タブが表示されています`);
        
        // タブをクリック
        await tabButton.click();
        await page.waitForTimeout(1000);
        
        // タブ切り替え後のスクリーンショット
        await page.screenshot({ 
          path: `screenshots/tab-${tabId}.png`,
          fullPage: true 
        });
        console.log(`📸 ${tabId}タブのスクリーンショットを保存しました`);
      } else {
        console.log(`❌ ${tabId}タブが表示されていません`);
      }
    }
    
    // Agentsタブに戻って詳細確認
    console.log('\n🤖 Agentsタブの詳細確認...');
    const agentsTab = await page.locator('button:has-text("Agents")');
    await agentsTab.click();
    await page.waitForTimeout(2000); // データ読み込みのため少し長めに待機
    
    // 統計カードの確認（新しいセレクター）
    const statsCards = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .bg-white');
    const cardCount = await statsCards.count();
    console.log(`✅ ${cardCount}個の統計カードが表示されています`);
    
    // 各統計カードの内容を確認
    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 4); i++) {
        const card = statsCards.nth(i);
        const title = await card.locator('p.text-sm').first().textContent();
        const value = await card.locator('p.text-2xl').first().textContent();
        console.log(`  📊 ${title}: ${value}`);
      }
    }
    
    // エージェントリストの確認（より具体的なセレクター）
    const agentList = await page.locator('text=Agents Overview').first();
    if (await agentList.isVisible()) {
      console.log('✅ エージェントリストが表示されています');
      
      // エージェントの数を確認
      const agents = await page.locator('.divide-y .px-6.py-4');
      const agentCount = await agents.count();
      console.log(`  🤖 ${agentCount}個のエージェントが表示されています`);
      
      // 最初のエージェントの詳細を確認
      if (agentCount > 0) {
        const firstAgent = agents.first();
        const agentName = await firstAgent.locator('h3').textContent();
        const agentStatus = await firstAgent.locator('.rounded-full').first().textContent();
        console.log(`  📋 最初のエージェント: ${agentName} (${agentStatus})`);
      }
    } else {
      console.log('❌ エージェントリストが表示されていません');
    }
    
    // パフォーマンスメトリクスの確認
    console.log('\n⚡ パフォーマンスメトリクスの確認...');
    const performanceSection = await page.locator('text=System Performance');
    if (await performanceSection.isVisible()) {
      console.log('✅ パフォーマンスメトリクスが表示されています');
    } else {
      console.log('❌ パフォーマンスメトリクスが表示されていません');
    }
    
    // レスポンシブデザインのテスト
    console.log('\n📱 レスポンシブデザインのテスト...');
    
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'screenshots/mobile-view.png',
      fullPage: true 
    });
    console.log('📸 モバイルビューのスクリーンショットを保存しました');
    
    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    // 最終スクリーンショット
    await page.screenshot({ 
      path: 'screenshots/final-desktop.png',
      fullPage: true 
    });
    console.log('📸 最終デスクトップビューのスクリーンショットを保存しました');
    
    console.log('\n🎉 UIテストが完了しました！');
    console.log('📁 スクリーンショットは screenshots/ フォルダに保存されました');
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    // ブラウザを閉じる前に少し待機
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

// screenshotsディレクトリを作成
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// テストを実行
testUI();
