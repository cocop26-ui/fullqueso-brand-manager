// Dashboard Functionality

// Wait for auth to be ready
auth.onAuthStateChanged((user) => {
    if (user) {
        initDashboard();
    }
});

// Global data storage
let clientesData = [];
let pedidosData = [];
let conversacionesData = [];

// Initialize dashboard
function initDashboard() {
    setupNavigation();
    loadClientes();
    loadPedidos();
    loadConversaciones();
    setupSearchAndFilters();
    setupExportButtons();
}

// Navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update active section
            const sectionName = link.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionName}-section`).classList.add('active');
        });
    });
}

// Load Clientes
function loadClientes() {
    db.collection('clientes_bot').onSnapshot((snapshot) => {
        clientesData = [];

        snapshot.forEach((doc) => {
            clientesData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderClientes(clientesData);
        updateClientesStats();
    }, (error) => {
        console.error('Error loading clientes:', error);
        showError('clientesTableBody', 'Error al cargar clientes');
    });
}

// Render Clientes table
function renderClientes(data) {
    const tbody = document.getElementById('clientesTableBody');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay clientes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(cliente => `
        <tr>
            <td>${cliente.telefono || 'N/A'}</td>
            <td>${cliente.nombre || 'N/A'}</td>
            <td>${cliente.cedula || 'N/A'}</td>
            <td>${cliente.direccion || 'N/A'}</td>
            <td>${cliente.total_pedidos || 0}</td>
            <td>${formatDate(cliente.ultimo_pedido)}</td>
            <td>${cliente.horario_preferido || 'N/A'}</td>
        </tr>
    `).join('');
}

// Update Clientes stats
function updateClientesStats() {
    document.getElementById('totalClientes').textContent = clientesData.length;
}

// Load Pedidos
function loadPedidos() {
    db.collection('pedidos_bot').orderBy('fecha_pedido', 'desc').onSnapshot((snapshot) => {
        pedidosData = [];

        snapshot.forEach((doc) => {
            pedidosData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderPedidos(pedidosData);
        updatePedidosStats();
    }, (error) => {
        console.error('Error loading pedidos:', error);
        showError('pedidosTableBody', 'Error al cargar pedidos');
    });
}

// Render Pedidos table
function renderPedidos(data) {
    const tbody = document.getElementById('pedidosTableBody');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay pedidos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(pedido => `
        <tr>
            <td><strong>${pedido.ticket || 'N/A'}</strong></td>
            <td>${pedido.cliente_nombre || 'N/A'}</td>
            <td>${formatProductos(pedido.productos)}</td>
            <td>${pedido.tipo || 'N/A'}</td>
            <td>$${pedido.total?.toFixed(2) || '0.00'}</td>
            <td>${formatDate(pedido.fecha_pedido)}</td>
            <td><span class="badge badge-${getEstadoClass(pedido.estado)}">${pedido.estado || 'N/A'}</span></td>
            <td>${pedido.seguimiento_enviado ? '✅ Sí' : '❌ No'}</td>
        </tr>
    `).join('');
}

// Update Pedidos stats
function updatePedidosStats() {
    document.getElementById('totalPedidos').textContent = pedidosData.length;

    const verificados = pedidosData.filter(p => p.estado === 'VERIFICADO').length;
    document.getElementById('pedidosVerificados').textContent = verificados;

    const entregados = pedidosData.filter(p => p.estado === 'ENTREGADO').length;
    document.getElementById('pedidosEntregados').textContent = entregados;
}

// Load Conversaciones
function loadConversaciones() {
    db.collection('conversaciones_bot').orderBy('fecha', 'desc').onSnapshot((snapshot) => {
        conversacionesData = [];

        snapshot.forEach((doc) => {
            conversacionesData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderConversaciones(conversacionesData);
        updateConversacionesStats();
    }, (error) => {
        console.error('Error loading conversaciones:', error);
        showError('conversacionesTableBody', 'Error al cargar conversaciones');
    });
}

// Render Conversaciones table
function renderConversaciones(data) {
    const tbody = document.getElementById('conversacionesTableBody');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay conversaciones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(conv => `
        <tr>
            <td>${formatDate(conv.fecha)}</td>
            <td>${conv.cliente_nombre || 'N/A'}</td>
            <td>${conv.pedido_ticket || 'N/A'}</td>
            <td class="message-cell">${conv.mensaje_ana || 'N/A'}</td>
            <td class="message-cell">${conv.mensaje_cliente || 'Sin respuesta'}</td>
            <td>${conv.tipo_interaccion || 'N/A'}</td>
            <td><span class="badge badge-${conv.sentimiento}">${conv.sentimiento || 'N/A'}</span></td>
            <td>${conv.requiere_atencion ? '⚠️ Sí' : '✅ No'}</td>
        </tr>
    `).join('');
}

// Update Conversaciones stats
function updateConversacionesStats() {
    document.getElementById('totalConversaciones').textContent = conversacionesData.length;

    const requierenAtencion = conversacionesData.filter(c => c.requiere_atencion).length;
    document.getElementById('conversacionesAtencion').textContent = requierenAtencion;
}

// Search and Filter functionality
function setupSearchAndFilters() {
    // Search Clientes
    document.getElementById('searchClientes').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = clientesData.filter(c =>
            (c.nombre?.toLowerCase().includes(searchTerm)) ||
            (c.telefono?.includes(searchTerm)) ||
            (c.cedula?.includes(searchTerm))
        );
        renderClientes(filtered);
    });

    // Search Pedidos
    document.getElementById('searchPedidos').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const estadoFilter = document.getElementById('filterEstado').value;

        let filtered = pedidosData.filter(p =>
            (p.ticket?.toLowerCase().includes(searchTerm)) ||
            (p.cliente_nombre?.toLowerCase().includes(searchTerm)) ||
            (p.pedido_id?.toLowerCase().includes(searchTerm))
        );

        if (estadoFilter) {
            filtered = filtered.filter(p => p.estado === estadoFilter);
        }

        renderPedidos(filtered);
    });

    // Filter Pedidos by Estado
    document.getElementById('filterEstado').addEventListener('change', (e) => {
        const searchTerm = document.getElementById('searchPedidos').value.toLowerCase();
        const estadoFilter = e.target.value;

        let filtered = pedidosData;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                (p.ticket?.toLowerCase().includes(searchTerm)) ||
                (p.cliente_nombre?.toLowerCase().includes(searchTerm))
            );
        }

        if (estadoFilter) {
            filtered = filtered.filter(p => p.estado === estadoFilter);
        }

        renderPedidos(filtered);
    });

    // Search Conversaciones
    document.getElementById('searchConversaciones').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const sentimientoFilter = document.getElementById('filterSentimiento').value;

        let filtered = conversacionesData.filter(c =>
            (c.cliente_nombre?.toLowerCase().includes(searchTerm)) ||
            (c.pedido_ticket?.toLowerCase().includes(searchTerm)) ||
            (c.mensaje_ana?.toLowerCase().includes(searchTerm))
        );

        if (sentimientoFilter) {
            filtered = filtered.filter(c => c.sentimiento === sentimientoFilter);
        }

        renderConversaciones(filtered);
    });

    // Filter Conversaciones by Sentimiento
    document.getElementById('filterSentimiento').addEventListener('change', (e) => {
        const searchTerm = document.getElementById('searchConversaciones').value.toLowerCase();
        const sentimientoFilter = e.target.value;

        let filtered = conversacionesData;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                (c.cliente_nombre?.toLowerCase().includes(searchTerm)) ||
                (c.mensaje_ana?.toLowerCase().includes(searchTerm))
            );
        }

        if (sentimientoFilter) {
            filtered = filtered.filter(c => c.sentimiento === sentimientoFilter);
        }

        renderConversaciones(filtered);
    });
}

// Export functionality
function setupExportButtons() {
    document.getElementById('exportClientes').addEventListener('click', () => {
        exportToCSV(clientesData, 'clientes', ['telefono', 'nombre', 'cedula', 'direccion', 'total_pedidos', 'horario_preferido']);
    });

    document.getElementById('exportPedidos').addEventListener('click', () => {
        exportToCSV(pedidosData, 'pedidos', ['ticket', 'cliente_nombre', 'tipo', 'total', 'estado', 'seguimiento_enviado']);
    });

    document.getElementById('exportConversaciones').addEventListener('click', () => {
        exportToCSV(conversacionesData, 'conversaciones', ['cliente_nombre', 'pedido_ticket', 'mensaje_ana', 'mensaje_cliente', 'tipo_interaccion', 'sentimiento', 'requiere_atencion']);
    });
}

// Export to CSV
function exportToCSV(data, filename, fields) {
    if (data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    // Create CSV header
    const header = fields.join(',');

    // Create CSV rows
    const rows = data.map(item => {
        return fields.map(field => {
            let value = item[field];

            // Handle special cases
            if (value === null || value === undefined) {
                return '';
            }

            // Handle timestamps
            if (value && value.toDate) {
                value = formatDate(value);
            }

            // Handle objects/arrays
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            // Escape commas and quotes
            value = String(value).replace(/"/g, '""');

            return `"${value}"`;
        }).join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper Functions

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

function formatProductos(productos) {
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return 'N/A';
    }

    return productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
}

function getEstadoClass(estado) {
    const classes = {
        'VERIFICADO': 'info',
        'ENTREGADO': 'success',
        'PENDIENTE': 'warning',
        'CANCELADO': 'danger'
    };

    return classes[estado] || 'secondary';
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<tr><td colspan="8" class="error">${message}</td></tr>`;
}
