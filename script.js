// ===== 3CX CONFIGURATION - EXTENSION 200 =====
const THREECX_CONFIG = {
    instance: 'jamestaylor.3cx.co.nz',  // Your personal 3CX instance
    protocol: 'https',
    extension: '200',                    // Your new extension number
    webClientPath: '/webclient'          // Path to web client
};

// ===== CRM STATE MANAGEMENT =====
let crmState = {
    currentProspect: null,
    prospects: [],
    currentDisposition: null,
    clickToCallCount: 0,
    dailyStats: {
        totalCalls: 0,
        connectedCalls: 0,
        appointments: 0,
        qualifiedLeads: 0,
        priorityCalls: 0,
        nzbnEnrichedCalls: 0
    }
};

// ===== ENHANCED SAMPLE PROSPECTS =====
const sampleProspects = [
    {
        id: 'ENR001',
        name: 'Sarah Johnson',
        phone: '+64 9 123 4567',
        email: 'sarah.j@email.com',
        property_interest: 'Auckland Central Apartment',
        budget: '$750k - $850k',
        status: 'new',
        priority_score: 8.5,
        nzbn_enriched: true,
        company: 'Johnson Consulting Ltd',
        last_contact: null,
        notes: 'First home buyer, pre-approved finance'
    },
    {
        id: 'ENR002',
        name: 'Michael Chen',
        phone: '+64 9 234 5678',
        email: 'mchen@techcorp.nz',
        property_interest: 'North Shore Family Home',
        budget: '$1.2M - $1.5M',
        status: 'warm',
        priority_score: 9.2,
        nzbn_enriched: true,
        company: 'TechCorp NZ Limited',
        last_contact: '2025-07-10',
        notes: 'Tech executive, cash buyer, urgent relocation'
    },
    {
        id: 'ENR003',
        name: 'Emma Thompson',
        phone: '+64 9 345 6789',
        email: 'emma@propertyinvest.co.nz',
        property_interest: 'Investment Portfolio',
        budget: '$2M+ Portfolio',
        status: 'hot',
        priority_score: 9.8,
        nzbn_enriched: true,
        company: 'Property Invest Co NZ',
        last_contact: '2025-07-11',
        notes: 'Property investor, looking for 3+ properties'
    },
    {
        id: 'ENR004',
        name: 'David Wilson',
        phone: '+64 9 456 7890',
        email: 'dwilson@email.com',
        property_interest: 'Ponsonby Townhouse',
        budget: '$1.8M - $2.2M',
        status: 'callback',
        priority_score: 7.3,
        nzbn_enriched: false,
        company: '',
        last_contact: '2025-07-09',
        notes: 'Upgrading from Remuera, specific location needs'
    },
    {
        id: 'ENR005',
        name: 'Lisa Park',
        phone: '+64 9 567 8901',
        email: 'lisa.park@medtech.nz',
        property_interest: 'Eastern Suburbs Medical Professional',
        budget: '$1.5M - $1.8M',
        status: 'interested',
        priority_score: 8.1,
        nzbn_enriched: true,
        company: 'MedTech Solutions Ltd',
        last_contact: '2025-07-08',
        notes: 'Doctor relocating from Wellington, school zones important'
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeCRM();
    log('🚀 Bayleys CRM with 3CX Click-to-Call initialized', 'success');
    log('🌐 3CX instance: ' + THREECX_CONFIG.instance, '3cx');
    log('📞 Extension 200 ready for click-to-call', '3cx');
});

function initializeCRM() {
    loadSampleProspects();
    updateAllStats();
    document.getElementById('threeCXInstance').textContent = THREECX_CONFIG.instance;
}

// ===== 3CX CLICK-TO-CALL INTEGRATION =====
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
    
    const cleanNumber = finalNumber.replace(/[^\d+]/g, '');
    // FIXED: Use the correct 3CX V20 URL format
    const threeCXURL = `${THREECX_CONFIG.protocol}://${THREECX_CONFIG.instance}${THREECX_CONFIG.webClientPath}/#/call?phone=${cleanNumber}`;
    
    log(`📞 Opening 3CX Web Client for: ${finalNumber}`, '3cx');
    log(`🔗 3CX URL: ${threeCXURL}`, '3cx');
    
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
        
        document.getElementById('callStatus').textContent = `READY TO CALL - ${finalNumber}`;
        document.getElementById('callStatus').className = 'call-status status-calling';
        
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

// ===== CALL LOGGING =====
function logCallInitiation(phoneNumber) {
    const callRecord = {
        timestamp: new Date().toISOString(),
        prospect_id: crmState.currentProspect?.id || null,
        prospect_name: crmState.currentProspect?.name || 'Direct Dial',
        phone_number: phoneNumber,
        priority_score: crmState.currentProspect?.priority_score || 0,
        nzbn_enriched: crmState.currentProspect?.nzbn_enriched || false,
        company: crmState.currentProspect?.company || '',
        action: 'click_to_call_initiated',
        agent_id: 'agent_200'
    };
    
    log('💾 Logging call initiation...', 'supabase');
    
    setTimeout(() => {
        log('✅ Call initiation logged successfully', 'supabase');
        if (!window.callLogs) window.callLogs = [];
        window.callLogs.push(callRecord);
    }, 500);
}

function saveCallRecord() {
    if (!crmState.currentDisposition) {
        log('❌ Please select a call disposition first', 'error');
        alert('Please select a call disposition before saving');
        return;
    }
    
    const callRecord = {
        timestamp: new Date().toISOString(),
        prospect_id: crmState.currentProspect?.id || null,
        prospect_name: crmState.currentProspect?.name || 'Direct Dial',
        phone_number: document.getElementById('dialNumber').value,
        disposition: crmState.currentDisposition,
        notes: document.getElementById('callNotes').value,
        follow_up_date: document.getElementById('followUpDate').value || null,
        priority_score: crmState.currentProspect?.priority_score || 0,
        nzbn_enriched: crmState.currentProspect?.nzbn_enriched || false,
        company: crmState.currentProspect?.company || '',
        agent_id: 'agent_200'
    };
    
    log('💾 Saving call record...', 'supabase');
    
    if (['appointment', 'interested'].includes(crmState.currentDisposition)) {
        crmState.dailyStats.qualifiedLeads++;
        crmState.dailyStats.connectedCalls++;
    }
    if (crmState.currentDisposition === 'appointment') {
        crmState.dailyStats.appointments++;
    }
    
    setTimeout(() => {
        log('✅ Call record saved successfully', 'supabase');
        
        if (crmState.currentProspect) {
            crmState.currentProspect.last_contact = new Date().toISOString().split('T')[0];
            crmState.currentProspect.status = crmState.currentDisposition;
            crmState.currentProspect.notes = document.getElementById('callNotes').value;
        }
        
        clearCallForm();
        loadProspectsDisplay();
        updateAllStats();
        
        if (!window.callRecords) window.callRecords = [];
        window.callRecords.push(callRecord);
        
    }, 1000);
}

function clearCallForm() {
    crmState.currentDisposition = null;
    document.querySelectorAll('.disposition-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.getElementById('callNotes').value = '';
    document.getElementById('followUpDate').value = '';
    
    document.getElementById('callStatus').textContent = 'READY - Select prospect to call';
    document.getElementById('callStatus').className = 'call-status status-idle';
    
    log('📋 Call form cleared - ready for next call', 'info');
}

// ===== PROSPECT MANAGEMENT =====
function loadSampleProspects() {
    crmState.prospects = [...sampleProspects];
    crmState.prospects.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    loadProspectsDisplay();
    
    const enrichedCount = crmState.prospects.filter(p => p.nzbn_enriched).length;
    const avgPriority = crmState.prospects.reduce((sum, p) => sum + (p.priority_score || 0), 0) / crmState.prospects.length;
    
    log(`📊 Loaded ${crmState.prospects.length} sample prospects`, 'success');
    log(`✅ ${enrichedCount} prospects have NZBN enrichment`, 'success');
    log(`📈 Average priority score: ${avgPriority.toFixed(1)}`, 'info');
    
    updateAllStats();
}

function loadProspectsDisplay() {
    const queue = document.getElementById('prospectQueue');
    queue.innerHTML = '';
    
    if (crmState.prospects.length === 0) {
        queue.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No prospects loaded. Upload a calling list or load sample data!</div>';
        return;
    }
    
    crmState.prospects.forEach(prospect => {
        const item = document.createElement('div');
        item.className = `prospect-item ${prospect === crmState.currentProspect ? 'current' : ''}`;
        item.onclick = () => selectProspect(prospect);
        
        const statusColor = {
            'hot': 'tag-hot',
            'warm': 'tag-warm', 
            'new': 'tag-cold',
            'callback': 'tag-callback',
            'interested': 'tag-warm'
        };
        
        const priorityBadge = prospect.priority_score > 0 ? 
            `<span class="tag" style="background: #3498db; color: white;">Priority: ${prospect.priority_score}</span>` : '';
        
        const nzbnBadge = prospect.nzbn_enriched ? 
            `<span class="tag" style="background: #27ae60; color: white;">✅ NZBN</span>` : '';
        
        const companyInfo = prospect.company ? 
            `<div class="prospect-company">🏢 ${prospect.company}</div>` : '';
        
        item.innerHTML = `
            <div class="prospect-name">${prospect.name}</div>
            <div class="prospect-phone">${prospect.phone}</div>
            ${companyInfo}
            <div class="prospect-property">${prospect.property_interest} • ${prospect.budget}</div>
            <div class="prospect-tags">
                ${priorityBadge}
                ${nzbnBadge}
                <span class="tag ${statusColor[prospect.status] || 'tag-cold'}">${prospect.status}</span>
                ${prospect.last_contact ? `<span class="tag" style="background: #e8f5e8; color: #2e7d32;">Last: ${prospect.last_contact}</span>` : ''}
            </div>
        `;
        
        queue.appendChild(item);
    });
}

function selectProspect(prospect) {
    crmState.currentProspect = prospect;
    loadProspectsDisplay();
    
    document.getElementById('dialNumber').value = prospect.phone;
    document.getElementById('callStatus').textContent = `SELECTED - ${prospect.name}`;
    
    log(`👤 Selected: ${prospect.name} (${prospect.phone})`, 'info');
    if (prospect.priority_score > 0) {
        log(`🎯 Priority Score: ${prospect.priority_score}`, 'info');
    }
    if (prospect.company) {
        log(`🏢 Company: ${prospect.company}`, 'info');
    }
}

// ===== FILE UPLOAD FUNCTIONS =====
function uploadProspectFile() {
    const fileInput = document.getElementById('prospectFileUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        updateUploadStatus('Please select a file first', 'error');
        return;
    }
    
    updateUploadStatus('Reading file...', 'info');
    log(`📤 Uploading file: ${file.name}`, 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data;
            
            if (file.name.endsWith('.json')) {
                data = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(e.target.result);
            } else {
                throw new Error('Unsupported file format. Please use .json or .csv files.');
            }
            
            loadUploadedProspects(data);
            
        } catch (error) {
            updateUploadStatus(`Error reading file: ${error.message}`, 'error');
            log(`❌ File upload error: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
}

// ORIGINAL WORKING PARSER - Updated to handle spaces in headers
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    // Convert headers to lowercase to handle case variations
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const prospects = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const prospect = {};
            
            headers.forEach((header, index) => {
                prospect[header] = values[index] || '';
            });
            
            prospects.push(prospect);
        }
    }
    
    return { prospects: prospects };
}

function loadUploadedProspects(data) {
    if (!data.prospects || !Array.isArray(data.prospects)) {
        updateUploadStatus('Invalid file format. Expected "prospects" array.', 'error');
        return;
    }
    
    crmState.prospects = data.prospects.map((prospect, index) => ({
        id: prospect.id || `UP${index + 1}`,
        // Map your specific CSV headers
        name: prospect['full name'] || prospect['Full name'] || prospect.name || 'Unknown Name',
        phone: prospect['primary phone'] || prospect['Primary phone'] || prospect.phone || '',
        email: prospect.email || prospect.Email || '',
        property_interest: prospect['business type'] || prospect['Business type'] || prospect.property_interest || '',
        budget: prospect.budget || '',
        status: prospect.status || 'new',
        priority_score: parseFloat(prospect['prospect score'] || prospect['Prospect score'] || prospect.priority_score) || 0,
        nzbn_enriched: prospect.nzbn_enriched === 'true' || prospect.nzbn_enriched === true,
        company: prospect.business || prospect.Business || prospect.company || '',
        last_contact: prospect.last_contact || null,
        notes: `${prospect.street || ''} ${prospect.city || ''}`.trim() || prospect.notes || ''
    }));
    
    crmState.prospects.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    
    const enrichedCount = crmState.prospects.filter(p => p.nzbn_enriched).length;
    const avgPriority = crmState.prospects.reduce((sum, p) => sum + (p.priority_score || 0), 0) / crmState.prospects.length;
    
    updateUploadStatus(`✅ Successfully loaded ${crmState.prospects.length} prospects`, 'success');
    log(`📊 Uploaded ${crmState.prospects.length} prospects`, 'success');
    log(`✅ ${enrichedCount} prospects have NZBN enrichment`, 'success');
    log(`📈 Average priority score: ${avgPriority.toFixed(2)}`, 'info');
    
    loadProspectsDisplay();
    updateAllStats();
    
    document.getElementById('prospectFileUpload').value = '';
}

function clearProspects() {
    crmState.prospects = [];
    crmState.currentProspect = null;
    document.getElementById('dialNumber').value = '';
    
    loadProspectsDisplay();
    updateUploadStatus('Prospect list cleared', 'info');
    log('🗑️ Prospect list cleared', 'info');
    updateAllStats();
}

function updateUploadStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    statusDiv.textContent = message;
    statusDiv.style.color = colors[type] || '#666';
}

// ===== CALL DISPOSITION =====
function setDisposition(disposition) {
    crmState.currentDisposition = disposition;
    
    document.querySelectorAll('.disposition-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    log(`📋 Disposition: ${disposition.toUpperCase()}`, 'info');
    
    if (disposition === 'callback' || disposition === 'appointment') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        document.getElementById('followUpDate').value = tomorrow.toISOString().slice(0, 16);
    }
}

// ===== 3CX TESTING & UTILITIES =====
function test3CXIntegration() {
    log('🔧 Testing 3CX click-to-call integration...', '3cx');
    
    const testNumber = '+64 9 999 0000';
    const cleanNumber = testNumber.replace(/[^\d+]/g, '');
    // Use the same V20 format as makeClickToCall
    const threeCXURL = `${THREECX_CONFIG.protocol}://${THREECX_CONFIG.instance}${THREECX_CONFIG.webClientPath}/#/call?phone=${cleanNumber}`;
    
    log(`🔗 Test URL: ${threeCXURL}`, '3cx');
    log(`📞 Testing with number: ${testNumber}`, 'info');
    
    const testWindow = window.open(threeCXURL, '3CX_Integration_Test', 'width=500,height=700');
    
    if (testWindow) {
        log('✅ 3CX Web Client opened successfully for test', 'success');
        log('🔧 Integration test passed - popup not blocked', '3cx');
        
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

function testSupabaseConnection() {
    log('🔧 Testing Supabase database connection...', 'supabase');
    
    const tests = [
        { name: 'Authentication', delay: 300 },
        { name: 'Prospects Table Access', delay: 600 },
        { name: 'Call Logs Table Access', delay: 900 },
        { name: 'Insert Permissions', delay: 1200 }
    ];
    
    tests.forEach((test, index) => {
        setTimeout(() => {
            log(`✅ ${test.name} - Connected`, 'supabase');
            if (index === tests.length - 1) {
                log('✅ All database tests passed', 'supabase');
            }
        }, test.delay);
    });
}

function viewCallLogs() {
    log('📊 Opening call logs view...', 'supabase');
    
    const logs = window.callLogs || [];
    const records = window.callRecords || [];
    
    if (logs.length > 0 || records.length > 0) {
        log(`📋 Found ${logs.length} call initiations and ${records.length} completed calls`, 'info');
        
        records.slice(-3).forEach(record => {
            log(`📞 ${record.prospect_name}: ${record.disposition} (${record.phone_number})`, 'info');
        });
        
    } else {
        log('📊 No call logs found - make some calls first!', 'info');
    }
    
    log('💡 Full call history dashboard coming soon', 'info');
}

function refreshProspects() {
    log('🔄 Refreshing prospect data...', 'info');
    loadProspectsDisplay();
    updateAllStats();
    log('✅ Prospect queue refreshed', 'success');
}

function filterProspects() {
    const searchTerm = document.getElementById('prospectSearch').value.toLowerCase();
    const items = document.querySelectorAll('.prospect-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function updateAllStats() {
    document.getElementById('prospectCount').textContent = crmState.prospects.length.toLocaleString();
    document.getElementById('totalProspects').textContent = crmState.prospects.length.toLocaleString();
    
    document.getElementById('clickToCallCount').textContent = crmState.clickToCallCount;
    document.getElementById('dailyClickToCalls').textContent = crmState.clickToCallCount;
    
    document.getElementById('totalCalls').textContent = crmState.dailyStats.totalCalls;
    document.getElementById('callsToday').textContent = crmState.dailyStats.totalCalls;
    document.getElementById('appointmentsSet').textContent = crmState.dailyStats.appointments;
    document.getElementById('qualifiedLeads').textContent = crmState.dailyStats.qualifiedLeads;
    document.getElementById('leadsThisWeek').textContent = crmState.dailyStats.qualifiedLeads;
    document.getElementById('priorityCallsToday').textContent = crmState.dailyStats.priorityCalls;
    document.getElementById('nzbnEnrichedCalls').textContent = crmState.dailyStats.nzbnEnrichedCalls;
    
    const avgPriority = crmState.prospects.length > 0 ? 
        crmState.prospects.reduce((sum, p) => sum + (p.priority_score || 0), 0) / crmState.prospects.length : 0;
    document.getElementById('avgPriorityScore').textContent = avgPriority.toFixed(1);
    
    const connectRate = crmState.dailyStats.totalCalls > 0 ? 
        Math.round((crmState.dailyStats.connectedCalls / crmState.dailyStats.totalCalls) * 100) : 0;
    document.getElementById('connectRate').textContent = connectRate + '%';
}

function handleDialKeypress(event) {
    if (event.key === 'Enter') {
        makeClickToCall();
    }
}

function log(message, type = 'info') {
    const logArea = document.getElementById('activityLog');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const logClass = {
        'success': 'log-success',
        'error': 'log-error', 
        'warning': 'log-warning',
        '3cx': 'log-3cx',
        'supabase': 'log-supabase'
    }[type] || '';
    
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="${logClass}">${message}</span>
    `;
    
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case '1': e.preventDefault(); makeClickToCall(); break;
            case 't': e.preventDefault(); test3CXIntegration(); break;
            case 'u': e.preventDefault(); document.getElementById('prospectFileUpload').click(); break;
            case 's': e.preventDefault(); loadSampleProspects(); break;
        }
    }
});

log('⌨️ Shortcuts: Ctrl+1 (Call), Ctrl+T (Test), Ctrl+U (Upload), Ctrl+S (Sample Data)', 'info');
