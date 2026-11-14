import fs from 'fs';
import path from 'path';

// 1. Inject Camera & Hardware Permissions to AndroidManifest.xml
const manifestPath = path.resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8');

  const cameraPermission = '    <uses-permission android:name="android.permission.CAMERA" />';
  const cameraFeature = '    <uses-feature android:name="android.hardware.camera" android:required="false" />';

  if (!content.includes('android.permission.CAMERA')) {
    if (content.includes('</manifest>')) {
      content = content.replace('</manifest>', `${cameraPermission}\n${cameraFeature}\n</manifest>`);
      fs.writeFileSync(manifestPath, content, 'utf8');
      console.log('✓ Successfully injected Camera permissions into AndroidManifest.xml');
    } else {
      console.warn('Could not find </manifest> tag in AndroidManifest.xml');
    }
  } else {
    console.log('• Camera permissions already present in AndroidManifest.xml');
  }
} else {
  console.log('• No AndroidManifest.xml found at:', manifestPath);
}

// 2. Configure MainActivity.java to automatically grant WebView Camera permission requests
const mainActivityPath = path.resolve(
  process.cwd(),
  'android/app/src/main/java/com/vectrfit/app/MainActivity.java'
);

if (fs.existsSync(mainActivityPath)) {
  const customMainActivity = `package com.vectrfit.app;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            request.grant(request.getResources());
                        }
                    });
                }
            });
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, customMainActivity, 'utf8');
  console.log('✓ Successfully configured MainActivity.java with WebChromeClient onPermissionRequest');
} else {
  console.log('• No MainActivity.java found at:', mainActivityPath);
}

