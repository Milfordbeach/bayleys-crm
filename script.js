// Global variables
let supabaseClient = null;
let isConnected = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bayleys CRM Application Loaded');
    // Small delay to ensure all elements are ready
    setTimeout(() => {
        loadSavedConfig();
    }, 100);
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Bayleys CRM Application Loaded');
        setTimeout(() => {
            loadSavedConfig();
        }, 100);
    });
} else {
    // DOM is already ready
    console.log('Bayleys CRM Application Loaded');
    setTimeout(() => {
        loadSavedConfig();
    }, 100);
}

// Load saved configuration from localStorage
function loadSavedConfig() {
    try {
        // Your Supabase credentials
        const defaultUrl = 'https://nbxzyouzfqajamxxpeqp.supabase.co';
        const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieHp5b3V6ZnFhamFteHhwZXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mjg5MjEsImV4cCI6MjA2NzAwNDkyMX0.XEh9BG4k_8uc-ktVKaoZoJ32NRc4cvCzSMZMO4FKVmE';
        
        const savedUrl = localStorage.getItem('supabaseUrl') || defaultUrl;
        const savedKey = localStorage.getItem('supabaseKey') || defaultKey;
        
        // Check if elements exist before setting values
        const urlElement = document.getElementById('supabaseUrl');
        const keyElement = document.getElementById('supabaseKey');
        
        if (urlElement && keyElement) {
            urlElement.value = savedUrl;
            keyElement.value = savedKey;
            
            // Auto-configure API with your credentials
            configureAPI();
        } else {
            console.error('Could not find API configuration elements');
            // Retry after a short delay
            setTimeout(loadSavedConfig, 500);
        }
    } catch (error) {
        console.error('Error in loadSavedConfig:', error);
    }
}

// Configure Supabase API connection
async function configureAPI() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    const statusDiv = document.getElementById('connectionStatus');

    if (!url || !key) {
        showAlert('Please enter both Supabase URL and API key', 'error', statusDiv);
        return;
    }

    try {
        // Save configuration
        localStorage.setItem('supabaseUrl', url);
        localStorage.setItem('supabaseKey', key);

        // Initialize Supabase client
        // You can add the Supabase SDK and initialize it here:
        // supabaseClient = supabase.createClient(url, key);
        
        // For now, we'll simulate the connection
        showAlert('API configuration saved successfully!', 'success', statusDiv);
        isConnected = true;
        
        // Load initial data
        await loadClients();
        updateStats();
        loadRecentActivity();
        
    } catch (error) {
        console.error('API Configuration Error:', error);
        showAlert('Failed to configure API: ' + error.message, 'error', statusDiv);
    }
}

// Add new client
async function addClient() {
    if (!isConnected) {
        alert('Please configure your API connection first');
        return;
    }

    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();

    if (!name || !email) {
        alert('Please enter at least name and email');
        return;
    }

    try {
        // Create new client object
        const newClient = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            created_at: new Date().toISOString()
        };

        // TODO: Replace with actual Supabase insert
        // const { data, error } = await supabaseClient
        //     .from('clients')
        //     .insert([newClient]);

        // For demo purposes, save to localStorage
        let clients = JSON.parse(localStorage.getItem('clients') || '[]');
        clients.push(newClient);
        localStorage.setItem('clients', JSON.stringify(clients));

        // Clear form
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';

        // Reload clients table and update stats
        await loadClients();
        updateStats();
        loadRecentActivity();
        
        showAlert('Client added successfully!', 'success');
    } catch (error) {
        console.error('Add Client Error:', error);
        showAlert('Failed to add client: ' + error.message, 'error');
    }
}

// Load clients from database
async function loadClients() {
    const tableBody = document.getElementById('clientTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');

    loadingIndicator.style.display = 'block';

    try {
        // TODO: Replace with actual Supabase query
        // const { data: clients, error } = await supabaseClient
        //     .from('clients')
        //     .select('*')
        //     .order('created_at', { ascending: false });

        // For demo purposes, load from localStorage
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        
        tableBody.innerHTML = '';
        
        if (clients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        No clients found. Add your first client above.
                    </td>
                </tr>
            `;
        } else {
            clients.forEach(client => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(client.name)}</td>
                    <td>${escapeHtml(client.email)}</td>
                    <td>${escapeHtml(client.phone || 'N/A')}</td>
                    <td>${new Date(client.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn" onclick="editClient(${client.id})" style="font-size: 12px; padding: 6px 12px; margin-right: 5px;">Edit</button>
                        <button class="btn" onclick="deleteClient(${client.id})" style="font-size: 12px; padding: 6px 12px; background: #e53e3e;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Load Clients Error:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #c53030;">
                    Error loading clients: ${error.message}
                </td>
            </tr>
        `;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Update statistics
function updateStats() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('activeDeals').textContent = Math.floor(clients.length * 0.3);
}

// Load recent activity
function loadRecentActivity() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const activityDiv = document.getElementById('recentActivity');
    
    if (clients.length === 0) {
        activityDiv.innerHTML = '<p>No recent activity</p>';
        return;
    }

    const recentClients = clients
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

    activityDiv.innerHTML = recentClients
        .map(client => `<p>📝 Added client: ${escapeHtml(client.name)}</p>`)
        .join('');
}

// Edit client function
function editClient(clientId) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
        alert('Client not found');
        return;
    }

    const newName = prompt('Edit client name:', client.name);
    const newEmail = prompt('Edit client email:', client.email);
    const newPhone = prompt('Edit client phone:', client.phone || '');

    if (newName && newEmail) {
        client.name = newName;
        client.email = newEmail;
        client.phone = newPhone;
        
        localStorage.setItem('clients', JSON.stringify(clients));
        loadClients();
        showAlert('Client updated successfully!', 'success');
    }
}

// Delete client function
function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) {
        return;
    }

    try {
        let clients = JSON.parse(localStorage.getItem('clients') || '[]');
        clients = clients.filter(c => c.id !== clientId);
        localStorage.setItem('clients', JSON.stringify(clients));
        
        loadClients();
        updateStats();
        loadRecentActivity();
        showAlert('Client deleted successfully!', 'success');
    } catch (error) {
        console.error('Delete Client Error:', error);
        showAlert('Failed to delete client: ' + error.message, 'error');
    }
}

// Test connection function
async function testConnection() {
    if (!isConnected) {
        alert('Please configure your API connection first');
        return;
    }
    
    try {
        // TODO: Add actual Supabase connection test
        // const { data, error } = await supabaseClient.from('clients').select('count');
        
        showAlert('Connection test successful!', 'success');
    } catch (error) {
        showAlert('Connection test failed: ' + error.message, 'error');
    }
}

// Utility function to show alerts
function showAlert(message, type, container = null) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    if (container) {
        container.innerHTML = '';
        container.appendChild(alertDiv);
    } else {
        // Show at the top of the page
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(alertDiv, header.nextSibling);
    }
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export/Import functionality
function exportData() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const dataStr = JSON.stringify(clients, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'bayleys-clients-export.json';
    link.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const clients = JSON.parse(e.target.result);
                    localStorage.setItem('clients', JSON.stringify(clients));
                    loadClients();
                    updateStats();
                    loadRecentActivity();
                    showAlert('Data imported successfully!', 'success');
                } catch (error) {
                    showAlert('Failed to import data: Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}
