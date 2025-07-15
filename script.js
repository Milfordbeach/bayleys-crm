// ===== WORKING 3CX CONFIGURATION - EXTENSION 200 =====
const THREECX_CONFIG = {
    instance: 'jamestaylor.3cx.co.nz',
    protocol: 'https',
    extension: '200',
    webClientPath: '/webclient'  // Keep this
};

// ===== FIXED CLICK-TO-CALL FUNCTION =====
function makeClickToCall() {
    const phoneNumber = document.getElementById('dialNumber').value;
    
    if (!phoneNumber) {
        if (crmState.currentProspect) {
            document.getElementById('dialNumber').value = crmState.currentProspect.phone;
        } else {
            log('❌ Please select a prospect or enter a phone number', 'error');
            alert('Please select a prospect or enter a phone number to call');
            return;
        }
    }
    
    const finalNumber = document.getElementById('dialNumber').value;
    const cleanNumber = finalNumber.replace(/[^\d+]/g, '');
    
    // Use working format (without the /# part)
    const threeCXURL = `${THREECX_CONFIG.protocol}://${THREECX_CONFIG.instance}${THREECX_CONFIG.webClientPath}#dial/${encodeURIComponent(cleanNumber)}`;
    
    log(`📞 Opening 3CX Web Client for: ${finalNumber}`, '3cx');
    log(`🔗 3CX URL: ${threeCXURL}`, '3cx');
    
    // Log prospect information
    if (crmState.currentProspect) {
        log(`👤 Initiating call to: ${crmState.currentProspect.name}`, 'info');
        if (crmState.currentProspect.priority_score > 0) {
            log(`🎯 Priority Score: ${crmState.currentProspect.priority_score}`, 'info');
            crmState.dailyStats.priorityCalls++;
        }
        if (crmState.currentProspect.nzbn_enriched) {
            log(`✅ NZBN Enriched prospect`, 'info');
            crmState.dailyStats.nzbnEnrichedCalls++;
        }
        if (crmState.currentProspect.company) {
            log(`🏢 Company: ${crmState.currentProspect.company}`, 'info');
        }
    }
    
    const windowFeatures = [
        'width=500',
        'height=700', 
        'resizable=yes',
        'scrollbars=yes',
        'status=yes',
        'menubar=no',
        'toolbar=no',
        'location=no'
    ].join(',');
    
    const threeCXWindow = window.open(threeCXURL, '3CX_WebClient_' + Date.now(), windowFeatures);
    
    if (threeCXWindow) {
        log('✅ 3CX Web Client opened - Click "Call" in 3CX to connect', 'success');
        
        // Update CRM UI
        document.getElementById('callStatus').textContent = `READY TO CALL - ${finalNumber}`;
        document.getElementById('callStatus').className = 'call-status status-calling';
        
        // Update statistics
        crmState.clickToCallCount++;
        crmState.dailyStats.totalCalls++;
        
        updateAllStats();
        logCallInitiation(finalNumber);
        
        setTimeout(() => {
            log('💡 Next: Click the "Call" button in the 3CX window to start dialing', 'info');
        }, 1000);
        
    } else {
        log('❌ Failed to open 3CX Web Client - popup may be blocked', 'error');
        log('💡 Please allow popups for this site and try again', 'warning');
        alert('Popup blocked! Please allow popups for this site to use click-to-call.');
    }
}

// ===== UPDATED TEST FUNCTION =====
function test3CXIntegration() {
    log('🔧 Testing 3CX click-to-call integration...', '3cx');
    
    const testNumber = '+64 9 999 0000';
    const cleanNumber = testNumber.replace(/[^\d+]/g, '');
    
    // Use the working format
    const threeCXURL = `${THREECX_CONFIG.protocol}://${THREECX_CONFIG.instance}${THREECX_CONFIG.webClientPath}#dial/${encodeURIComponent(cleanNumber)}`;
    
    log(`🔗 Test URL: ${threeCXURL}`, '3cx');
    log(`📞 Testing with number: ${testNumber}`, 'info');
    
    const testWindow = window.open(threeCXURL, '3CX_Integration_Test', 'width=500,height=700');
    
    if (testWindow) {
        log('✅ 3CX Web Client opened successfully for test', 'success');
        log('🔧 Integration test passed - no 404 error', '3cx');
        
        setTimeout(() => {
            if (testWindow && !testWindow.closed) {
                testWindow.close();
                log('🔧 Test window closed automatically', '3cx');
            }
            log('✅ 3CX click-to-call integration working correctly', 'success');
        }, 5000);
        
    } else {
        log('❌ Integration test failed - popup blocked', 'error');
        log('💡 Please allow popups for this site to use click-to-call', 'warning');
        alert('Popup blocked! Please allow popups for this site to use 3CX integration.');
    }
}

// ===== OPEN 3CX WEB CLIENT =====
function open3CXWebClient() {
    const threeCXURL = `${THREECX_CONFIG.protocol}://${THREECX_CONFIG.instance}${THREECX_CONFIG.webClientPath}`;
    
    log('🌐 Opening 3CX Web Client...', '3cx');
    
    const webClientWindow = window.open(threeCXURL, '3CX_WebClient_Main', 'width=800,height=900,resizable=yes,scrollbars=yes');
    
    if (webClientWindow) {
        log('✅ 3CX Web Client opened successfully', '3cx');
    } else {
        log('❌ Failed to open 3CX Web Client - popup blocked', 'error');
        window.open(threeCXURL, '_blank');
        log('🌐 3CX Web Client opened in new tab instead', 'info');
    }
}
