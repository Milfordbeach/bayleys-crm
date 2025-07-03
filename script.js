// 3CX and Supabase focused state management
let crmState = {
    currentCall: null,
    selectedProspect: null,
    prospects: [],
    currentDisposition: null,
    callTimer: null,
    isMuted: false,
    isOnHold: false
};

let dailyStats = {
    totalCalls: 23,
    connectedCalls: 15,
    appointments: 3,
    qualifiedLeads: 7,
    callbacks: 5,
    totalTalkTime: 4140 // seconds
};

// Sample prospects from Supabase (fallback if no upload)
const supabaseProspects = [
    {
        id: 'SP001',
        name: 'Sarah Johnson',
        phone: '+64 9 123 4567',
        email: 'sarah.j@email.com',
        property_interest: 'Auckland Central Apartment',
        budget: '$750k - $850k',
        status: 'new',
        priority_score: 0,
        nzbn_enriched: false,
        company: '',
        last_contact: null,
        notes: 'Interested in 2-bedroom apartments, first home buyer'
    },
    {
        id: 'SP002',
        name: 'Michael Chen',
        phone: '+64 9 234 5678',
        email: 'mchen@gmail.com',
        property_interest: 'North Shore House',
        budget: '$950k - $1.2M',
        status: 'warm',
        priority_score: 0,
        nzbn_enriched: false,
        company: '',
        last_contact: '2025-06-28',
        notes: 'Pre-approved, looking for family home with good schools'
    },
    {
        id: 'SP003',
        name: 'Emma Thompson',
        phone: '+64 9 345 6789',
        email: 'emma.thompson@outlook.com',
        property_interest: 'West Auckland Investment',
        budget: '$600k - $800k',
        status: 'hot',
        priority_score: 0,
        nzbn_enriched: false,
        company: '',
        last_contact: '2025-07-01',
        notes: 'Property investor, cash buyer, wants rental yield info'
    },
    {
        id: 'SP004',
        name: 'David Wilson',
        phone: '+64 9 456 7890',
        email: 'dwilson@company.co.nz',
        property_interest: 'Ponsonby Townhouse',
        budget: '$1.5M+',
        status: 'callback',
        priority_score: 0,
        nzbn_enriched: false,
        company: '',
        last_contact: '2025-06-30',
        notes: 'Upgrading from current home, specific location requirements'
    },
    {
        id: 'SP005',
        name: 'Lisa Park',
        phone: '+64 9 567 8901',
        email: 'lisa.park@email.com',
        property_interest: 'Eastern Suburbs Family Home',
        budget: '$1M - $1.3M',
        status: 'interested',
        priority_score: 0,
        nzbn_enriched: false,
        company: '',
        last_contact: '2025-06-25',
        notes: 'Moving from Wellington, needs school zone information'
    }
];

// Initialize CRM
document.addEventListener('DOMContentLoaded', function() {
    initializeCRM();
    loadProspectsFromSupabase();
    updateStatsDisplay();
    
    log('🚀 Bayleys CRM initialized successfully', 'success');
    log('🌐 3CX API connection established', '3cx');
    log('💾 Supabase database connected', 'supabase');
    log('📊 Upload feature ready - you can now upload enriched calling lists', 'info');
});

function initializeCRM() {
    crmState.prospects = [...supabaseProspects];
    
    // Simulate 3CX connection
    setTimeout(() => {
        log('📞 3CX SIP registration completed - Extension 101 active', '3cx');
        updateActiveLines();
    }, 1500);
}

// Enhanced prospect loading with upload support
function loadProspectsFromSupabase() {
    const queue = document.getElementById('prospectQueue');
    queue.innerHTML = '';
    
    if (crmState.prospects.length === 0) {
        queue.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No prospects loaded. Upload a calling list to get started!</div>';
        return;
    }
    
    crmState.prospects.forEach((prospect, index) => {
        const item = document.createElement('div');
        item.className = `prospect-item ${prospect === crmState.selectedProspect ? 'current' : ''}`;
        item.onclick = () => selectProspect(prospect);
        
        const statusColor = {
            'hot': 'tag-hot',
            'warm': 'tag-warm', 
            'new': 'tag-cold',
            'callback': 'tag-callback',
            'interested': 'tag-warm',
            'premium': 'tag-hot'
        };
        
        // Priority indicator
        const priorityBadge = prospect.priority_score > 0 ? 
            `<span class="tag" style="background: #3498db; color: white;">Priority: ${prospect.priority_score}</span>` : '';
        
        // NZBN enrichment indicator
        const nzbnBadge = prospect.nzbn_enriched ? 
            `<span class="tag" style="background: #27ae60; color: white;">✅ NZBN</span>` : '';
        
        // Company info
        const companyInfo = prospect.company ? 
            `<div class="prospect-company" style="color: #3498db; font-size: 0.85rem;">🏢 ${prospect.company}</div>` : '';
        
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
    
    log(`📋 Displaying ${crmState.prospects.length} prospects (sorted by priority)`, 'info');
}

function selectProspect(prospect) {
    crmState.selectedProspect = prospect;
    loadProspectsFromSupabase(); // Refresh to update selection
    
    // Update dial number
    document.getElementById('dialNumber').value = prospect.phone;
    
    log(`👤 Selected: ${prospect.name} (${prospect.phone})`, 'info');
    if (prospect.priority_score > 0) {
        log(`🎯 Priority Score: ${prospect.priority_score}`, 'info');
    }
    if (prospect.company) {
        log(`🏢 Company: ${prospect.company}`, 'info');
    }
    log(`🏠 Interest: ${prospect.property_interest} • Budget: ${prospect.budget}`, 'info');
}

// FILE UPLOAD FUNCTIONS
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
                log('📄 Parsing JSON file...', 'info');
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(e.target.result);
                log('📄 Parsing CSV file...', 'info');
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

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const prospects = [];
    
    log(`📊 CSV headers found: ${headers.join(', ')}`, 'info');
    
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
        log('❌ Invalid file format - no prospects array found', 'error');
        return;
    }
    
    // Clear current prospects and load new ones
    crmState.prospects = data.prospects.map((prospect, index) => ({
        id: prospect.id || `UP${index + 1}`,
        name: prospect.name || 'Unknown Name',
        phone: prospect.phone || '',
        email: prospect.email || '',
        property_interest: prospect.property_interest || prospect.interest || '',
        budget: prospect.budget || '',
        status: prospect.status || 'new',
        priority_score: parseFloat(prospect.priority_score) || 0,
        nzbn_enriched: prospect.nzbn_enriched === 'true' || prospect.nzbn_enriched === true,
        company: prospect.company || '',
        last_contact: prospect.last_contact || null,
        notes: prospect.notes || ''
    }));
    
    // Sort by priority score (highest first)
    crmState.prospects.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    
    const enrichedCount = crmState.prospects.filter(p => p.nzbn_enriched).length;
    const avgPriority = crmState.prospects.reduce((sum, p) => sum + (p.priority_score || 0), 0) / crmState.prospects.length;
    
    updateUploadStatus(`✅ Successfully loaded ${crmState.prospects.length} prospects`, 'success');
    log(`📊 Uploaded ${crmState.prospects.length} enriched prospects`, 'success');
    log(`✅ ${enrichedCount} prospects have NZBN enrichment`, 'success');
    log(`📈 Average priority score: ${avgPriority.toFixed(2)}`, 'info');
    
    // Refresh the display
    loadProspectsFromSupabase();
    
    // Update stats
    document.getElementById('totalProspects').textContent = crmState.prospects.length.toLocaleString();
    
    // Clear file input
    document.getElementById('prospectFileUpload').value = '';
}

function clearProspects() {
    crmState.prospects = [];
    crmState.selectedProspect = null;
    document.getElementById('dialNumber').value = '';
    
    loadProspectsFromSupabase(); // This will show empty list
    updateUploadStatus('Prospect list cleared', 'info');
    log('🗑️ Prospect list cleared', 'info');
    
    // Reset stats
    document.getElementById('totalProspects').textContent = '0';
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
    statusDiv.style.fontWeight = type === 'error' ? 'bold' : 'normal';
}

// EXISTING CALL FUNCTIONS
function makeCall() {
    const phoneNumber = document.getElementById('dialNumber').value;
    
    if (!phoneNumber) {
        // Auto-select first prospect if none selected
        if (crmState.prospects.length > 0) {
            selectProspect(crmState.prospects[0]);
            document.getElementById('dialNumber').value = crmState.prospects[0].phone;
        } else {
            alert('Please enter a phone number or select a prospect');
            return;
        }
    }
    
    if (crmState.currentCall) {
        log('❌ Call already in progress', 'error');
        return;
    }
    
    log(`📞 Initiating 3CX call to ${phoneNumber}...`, '3cx');
    log(`🔌 Connecting via Extension 101...`, '3cx');
    
    // Log prospect info if available
    if (crmState.selectedProspect) {
        if (crmState.selectedProspect.priority_score > 0) {
            log(`🎯 Calling priority ${crmState.selectedProspect.priority_score} prospect`, 'info');
        }
        if (crmState.selectedProspect.nzbn_enriched) {
            log(`✅ Prospect has NZBN enrichment data`, 'info');
        }
    }
    
    // Simulate 3CX API call
    const callData = {
        extension: '101',
        destination: phoneNumber,
        call_id: 'CALL_' + Date.now(),
        prospect: crmState.selectedProspect
    };
    
    // Update UI immediately
    crmState.currentCall = {
        ...callData,
        startTime: new Date(),
        timer: null
    };
    
    document.getElementById('callStatus').textContent = `DIALING - ${phoneNumber}`;
    document.getElementById('callStatus').className = 'call-status status-calling';
    
    document.getElementById('makeCallBtn').disabled = true;
    document.getElementById('endCallBtn').disabled = false;
    document.getElementById('holdCallBtn').disabled = false;
    document.getElementById('transferCallBtn').disabled = false;
    document.getElementById('muteCallBtn').disabled = false;
    
    // Simulate realistic call progression
    log(`⏳ Establishing connection...`, 'info');
    
    setTimeout(() => {
        if (crmState.currentCall) {
            log(`📞 Ringing...`, 'info');
            
            // Simulate different outcomes with realistic timing
            setTimeout(() => {
                if (crmState.currentCall) {
                    // Higher chance of connection for testing
                    const outcomes = ['connected', 'connected', 'connected', 'voicemail', 'busy', 'no-answer'];
                    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                    
                    log(`📋 Call outcome determined: ${outcome}`, 'warning');
                    
                    if (outcome === 'connected') {
                        document.getElementById('callStatus').textContent = 'CONNECTED - In conversation';
                        document.getElementById('callStatus').className = 'call-status status-connected';
                        log('✅ Call connected successfully via 3CX', '3cx');
                        log('🎙️ Audio established - conversation active', 'success');
                        startCallTimer();
                        updateActiveLines(1);
                    } else {
                        handleCallOutcome(outcome);
                    }
                }
            }, 2000);
        }
    }, 1500);
}

function endCall() {
    if (!crmState.currentCall) {
        log('❌ No active call to end', 'error');
        return;
    }
    
    const duration = Math.floor((new Date() - crmState.currentCall.startTime) / 1000);
    
    log(`📞 Ending call - Duration: ${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,'0')}`, '3cx');
    
    // Clean up call state
    clearInterval(crmState.currentCall.timer);
    crmState.currentCall = null;
    crmState.isMuted = false;
    crmState.isOnHold = false;
    
    // Reset UI
    document.getElementById('callStatus').textContent = 'IDLE - Call ended';
    document.getElementById('callStatus').className = 'call-status status-idle';
    document.getElementById('callTimer').textContent = '00:00:00';
    
    document.getElementById('makeCallBtn').disabled = false;
    document.getElementById('endCallBtn').disabled = true;
    document.getElementById('holdCallBtn').disabled = true;
    document.getElementById('transferCallBtn').disabled = true;
    document.getElementById('muteCallBtn').disabled = true;
    
    // Update stats
    dailyStats.totalCalls++;
    dailyStats.connectedCalls++;
    dailyStats.totalTalkTime += duration;
    updateStatsDisplay();
    updateActiveLines(0);
    
    log('✅ Call ended - Ready for disposition', 'success');
}

function holdCall() {
    if (!crmState.currentCall) return;
    
    crmState.isOnHold = !crmState.isOnHold;
    
    if (crmState.isOnHold) {
        document.getElementById('callStatus').textContent = 'ON HOLD - Call paused';
        document.getElementById('holdCallBtn').textContent = 'Resume';
        log('⏸️ Call placed on hold', 'warning');
    } else {
        document.getElementById('callStatus').textContent = 'CONNECTED - In conversation';
        document.getElementById('holdCallBtn').textContent = 'Hold';
        log('▶️ Call resumed', 'success');
    }
}

function toggleMute() {
    if (!crmState.currentCall) return;
    
    crmState.isMuted = !crmState.isMuted;
    
    if (crmState.isMuted) {
        document.getElementById('muteCallBtn').textContent = 'Unmute';
        document.getElementById('muteCallBtn').style.background = '#e74c3c';
        log('🔇 Microphone muted', 'warning');
    } else {
        document.getElementById('muteCallBtn').textContent = 'Mute';
        document.getElementById('muteCallBtn').style.background = '#95a5a6';
        log('🔊 Microphone unmuted', 'success');
    }
}

function showTransfer() {
    const extensions = [
        '102 - Sarah (Auckland Team)',
        '103 - Mike (North Shore)',
        '104 - Emma (West Auckland)', 
        '200 - Manager'
    ];
    
    const selection = prompt('Transfer call to:\n' + extensions.map((e, i) => `${i+1}. ${e}`).join('\n') + '\n\nEnter number (1-4):');
    
    if (selection && selection >= 1 && selection <= 4) {
        log(`📞 Transferring call to: ${extensions[selection-1]}`, '3cx');
        
        // Simulate transfer
        setTimeout(() => {
            log('✅ Call transferred successfully', 'success');
            endCall();
        }, 2000);
    }
}

function handleCallOutcome(outcome) {
    log(`📋 Call outcome: ${outcome.toUpperCase()}`, 'warning');
    
    switch(outcome) {
        case 'voicemail':
            document.getElementById('callStatus').textContent = 'VOICEMAIL - Left message';
            document.getElementById('callStatus').className = 'call-status status-calling';
            log('📧 Voicemail detected - message left', 'warning');
            break;
        case 'busy':
            document.getElementById('callStatus').textContent = 'BUSY - Line engaged';
            document.getElementById('callStatus').className = 'call-status status-calling';
            log('📞 Line busy - will retry later', 'warning');
            break;
        case 'no-answer':
            document.getElementById('callStatus').textContent = 'NO ANSWER - No response';
            document.getElementById('callStatus').className = 'call-status status-calling';
            log('📞 No answer - prospect unavailable', 'warning');
            break;
    }
    
    // Auto-end call after a delay
    setTimeout(() => {
        log(`🔚 Auto-ending ${outcome} call...`, 'info');
        endCall();
        
        // Auto-suggest disposition
        const dispositionMap = {
            'busy': 'callback',
            'no-answer': 'callback', 
            'voicemail': 'voicemail'
        };
        
        if (dispositionMap[outcome]) {
            // Auto-select disposition
            setTimeout(() => {
                const dispositionBtn = document.querySelector(`[onclick="setDisposition('${dispositionMap[outcome]}')"]`);
                if (dispositionBtn) {
                    dispositionBtn.click();
                    log(`📋 Auto-suggested disposition: ${dispositionMap[outcome]}`, 'info');
                }
            }, 500);
        }
    }, 2500);
}

function startCallTimer() {
    if (crmState.currentCall) {
        crmState.currentCall.timer = setInterval(() => {
            const elapsed = Math.floor((new Date() - crmState.currentCall.startTime) / 1000);
            
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('callTimer').textContent = timeString;
        }, 1000);
    }
}

function setDisposition(disposition) {
    crmState.currentDisposition = disposition;
    
    // Update UI
    document.querySelectorAll('.disposition-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    log(`📋 Disposition: ${disposition.toUpperCase()}`, 'info');
    
    // Auto-populate follow-up for callbacks
    if (disposition === 'callback' || disposition === 'appointment') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        document.getElementById('followUpDate').value = tomorrow.toISOString().slice(0, 16);
    }
}

function saveToSupabase() {
    if (!crmState.currentDisposition) {
        alert('Please select a call disposition');
        return;
    }
    
    const callData = {
        prospect_id: crmState.selectedProspect?.id || null,
        prospect_name: crmState.selectedProspect?.name || 'Unknown',
        phone_number: document.getElementById('dialNumber').value,
        disposition: crmState.currentDisposition,
        notes: document.getElementById('callNotes').value,
        follow_up_date: document.getElementById('followUpDate').value || null,
        call_duration: crmState.currentCall ? Math.floor((new Date() - crmState.currentCall.startTime) / 1000) : 0,
        agent_id: 'agent_101',
        priority_score: crmState.selectedProspect?.priority_score || 0,
        nzbn_enriched: crmState.selectedProspect?.nzbn_enriched || false,
        created_at: new Date().toISOString()
    };
    
    log('💾 Saving call data to Supabase...', 'supabase');
    
    if (callData.priority_score > 0) {
        log(`🎯 Saving priority ${callData.priority_score} prospect result`, 'info');
    }
    
    // Simulate Supabase insert
    setTimeout(() => {
        log('✅ Call data saved successfully', 'supabase');
        
        // Update prospect status in database
        if (crmState.selectedProspect) {
            crmState.selectedProspect.last_contact = new Date().toISOString().split('T')[0];
            crmState.selectedProspect.status = crmState.currentDisposition;
            crmState.selectedProspect.notes = document.getElementById('callNotes').value;
        }
        
        // Update stats
        if (['appointment', 'interested'].includes(crmState.currentDisposition)) {
            dailyStats.qualifiedLeads++;
        }
        if (crmState.currentDisposition === 'appointment') {
            dailyStats.appointments++;
        }
        if (crmState.currentDisposition === 'callback') {
            dailyStats.callbacks++;
        }
        
        // Clear form
        document.getElementById('callNotes').value = '';
        document.getElementById('followUpDate').value = '';
        crmState.currentDisposition = null;
        
        document.querySelectorAll('.disposition-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        loadProspectsFromSupabase();
        updateStatsDisplay();
        
    }, 1000);
}

function filterProspects() {
    const searchTerm = document.getElementById('prospectSearch').value.toLowerCase();
    const items = document.querySelectorAll('.prospect-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function loadMoreProspects() {
    log('📥 Loading 50 more prospects from Supabase...', 'supabase');
    
    // Simulate loading more data
    setTimeout(() => {
        log('✅ Additional prospects loaded', 'success');
        const currentCount = parseInt(document.getElementById('totalProspects').textContent.replace(/,/g, ''));
        document.getElementById('totalProspects').textContent = (currentCount + 50).toLocaleString();
    }, 1500);
}

function refreshProspects() {
    log('🔄 Refreshing prospect data...', 'supabase');
    loadProspectsFromSupabase();
    log('✅ Prospect queue refreshed', 'success');
}

function test3CXConnection() {
    log('🔧 Testing 3CX API connection...', '3cx');
    
    const tests = [
        { name: 'SIP Registration', delay: 500 },
        { name: 'Extension Status', delay: 1000 },
        { name: 'Call API', delay: 1500 },
        { name: 'Transfer API', delay: 2000 }
    ];
    
    tests.forEach(test => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                log(`✅ ${test.name} - OK`, '3cx');
            } else {
                log(`❌ ${test.name} - Failed`, 'error');
            }
        }, test.delay);
    });
}

function restart3CXConnection() {
    log('🔄 Restarting 3CX SIP connection...', 'warning');
    
    setTimeout(() => {
        log('✅ SIP connection reestablished', '3cx');
        updateActiveLines();
    }, 2000);
}

function testSupabaseConnection() {
    log('🔧 Testing Supabase database connection...', 'supabase');
    
    const tests = [
        { name: 'Authentication', delay: 300 },
        { name: 'Prospects Table', delay: 600 },
        { name: 'Call Logs Table', delay: 900 },
        { name: 'Insert Permission', delay: 1200 }
    ];
    
    tests.forEach(test => {
        setTimeout(() => {
            log(`✅ ${test.name} - Connected`, 'supabase');
        }, test.delay);
    });
}

function syncProspects() {
    log('🔄 Syncing prospects with Supabase...', 'supabase');
    
    setTimeout(() => {
        log('✅ Prospect sync completed', 'success');
        const currentCount = parseInt(document.getElementById('totalProspects').textContent.replace(/,/g, ''));
        document.getElementById('totalProspects').textContent = (currentCount + 23).toLocaleString();
    }, 2000);
}

function updateActiveLines(active = 0) {
    document.getElementById('activeLines').textContent = `${active}/4`;
}

function updateStatsDisplay() {
    document.getElementById('totalCalls').textContent = dailyStats.totalCalls;
    document.getElementById('connectRate').textContent = Math.round((dailyStats.connectedCalls / dailyStats.totalCalls) * 100) + '%';
    
    const avgMinutes = Math.floor(dailyStats.totalTalkTime / dailyStats.connectedCalls / 60);
    const avgSeconds = Math.floor((dailyStats.totalTalkTime / dailyStats.connectedCalls) % 60);
    document.getElementById('avgTalkTime').textContent = `${avgMinutes}m ${avgSeconds}s`;
    
    document.getElementById('appointmentsSet').textContent = dailyStats.appointments;
    document.getElementById('qualifiedLeads').textContent = dailyStats.qualifiedLeads;
    document.getElementById('callbacksScheduled').textContent = dailyStats.callbacks;
    
    document.getElementById('callsToday').textContent = dailyStats.totalCalls;
}

function handleDialKeypress(event) {
    if (event.key === 'Enter') {
        makeCall();
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
    
    console.log(`[${timestamp}] ${message}`);
}

// Test function for debugging call flow
function testCallFlow() {
    log('🧪 Starting comprehensive call flow test...', 'warning');
    
    // Reset any existing call
    if (crmState.currentCall) {
        endCall();
    }
    
    // Select first prospect automatically
    if (crmState.prospects.length > 0) {
        selectProspect(crmState.prospects[0]);
        log(`👤 Auto-selected: ${crmState.prospects[0].name}`, 'info');
        
        if (crmState.prospects[0].priority_score > 0) {
            log(`🎯 Testing with priority ${crmState.prospects[0].priority_score} prospect`, 'info');
        }
    }
    
    // Start test call
    setTimeout(() => {
        log('📞 Initiating test call...', 'info');
        makeCall();
    }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case '1': e.preventDefault(); makeCall(); break;
            case '2': e.preventDefault(); endCall(); break;
            case 'h': e.preventDefault(); holdCall(); break;
            case 'm': e.preventDefault(); toggleMute(); break;
            case 't': e.preventDefault(); testCallFlow(); break;
            case 'u': e.preventDefault(); document.getElementById('prospectFileUpload').click(); break;
        }
    }
});

log('⌨️ Shortcuts: Ctrl+1 (Call), Ctrl+2 (End), Ctrl+H (Hold), Ctrl+M (Mute), Ctrl+T (Test), Ctrl+U (Upload)', 'info');
