import streamlit as st
import json
import os
from datetime import datetime, time, date
import pandas as pd
from pathlib import Path
import base64

# Configuración de la página
st.set_page_config(
    page_title="Marketing Manager Pro",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Crear directorios base
def ensure_directories():
    directories = [
        "data/productos",
        "data/briefs", 
        "data/promociones",
        "data/referencias",
        "uploads/powerpoint",
        "uploads/canva",
        "uploads/brand_guidelines",
        "uploads/productos"
    ]
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)

ensure_directories()

# Funciones de utilidad
def save_json_data(data, filename):
    """Guardar datos en formato JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

def load_json_data(filename):
    """Cargar datos desde JSON"""
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_uploaded_file(uploaded_file, folder):
    """Guardar archivo subido"""
    if uploaded_file is not None:
        file_path = f"{folder}/{uploaded_file.name}"
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        return file_path
    return None

# ========================================
# GESTIÓN DE PRODUCTOS
# ========================================

def render_productos():
    st.header("🛍️ Gestión de Productos")
    
    tab1, tab2 = st.tabs(["➕ Agregar Producto", "📋 Ver Productos"])
    
    with tab1:
        st.subheader("Nuevo Producto")
        
        with st.form("producto_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                nombre = st.text_input("🏷️ Nombre del Producto *", placeholder="Ej: Pizza Margherita")
                precio = st.number_input("💰 Precio *", min_value=0.0, format="%.2f", placeholder="0.00")
                categoria = st.selectbox("📂 Categoría", 
                    ["Comida", "Bebida", "Postre", "Entrada", "Plato Principal", "Combo", "Otro"])
                
            with col2:
                descripcion = st.text_area("📝 Descripción *", 
                    placeholder="Describe el producto, ingredientes, características...")
                estado = st.selectbox("🔄 Estado", ["Activo", "Inactivo", "Agotado"])
                tiempo_prep = st.number_input("⏱️ Tiempo de Preparación (min)", min_value=0, value=15)
            
            # Disponibilidad por días
            st.subheader("📅 Disponibilidad")
            col_dias1, col_dias2 = st.columns(2)
            
            dias_semana = {}
            with col_dias1:
                dias_semana['lunes'] = st.checkbox("Lunes")
                dias_semana['martes'] = st.checkbox("Martes") 
                dias_semana['miercoles'] = st.checkbox("Miércoles")
                dias_semana['jueves'] = st.checkbox("Jueves")
                
            with col_dias2:
                dias_semana['viernes'] = st.checkbox("Viernes")
                dias_semana['sabado'] = st.checkbox("Sábado")
                dias_semana['domingo'] = st.checkbox("Domingo")
            
            # Horarios de disponibilidad
            col_hora1, col_hora2 = st.columns(2)
            with col_hora1:
                hora_inicio = st.time_input("🕐 Hora de Inicio", value=time(9, 0))
            with col_hora2:
                hora_fin = st.time_input("🕕 Hora de Fin", value=time(22, 0))
            
            # Imágenes del producto
            st.subheader("🖼️ Imágenes del Producto")
            imagenes = st.file_uploader(
                "Subir imágenes", 
                type=['png', 'jpg', 'jpeg'],
                accept_multiple_files=True,
                key="producto_imagenes"
            )
            
            # Información adicional
            with st.expander("ℹ️ Información Adicional"):
                col_extra1, col_extra2 = st.columns(2)
                with col_extra1:
                    stock = st.number_input("📦 Stock Disponible", min_value=0, value=0)
                    calorias = st.number_input("🔥 Calorías", min_value=0, value=0)
                with col_extra2:
                    ingredientes = st.text_area("🥗 Ingredientes", placeholder="Lista de ingredientes...")
                    alergenos = st.text_input("⚠️ Alérgenos", placeholder="Gluten, lactosa, frutos secos...")
            
            submitted = st.form_submit_button("💾 Guardar Producto", type="primary")
            
            if submitted:
                if nombre and precio > 0 and descripcion:
                    # Guardar imágenes
                    rutas_imagenes = []
                    if imagenes:
                        for imagen in imagenes:
                            ruta = save_uploaded_file(imagen, "uploads/productos")
                            if ruta:
                                rutas_imagenes.append(ruta)
                    
                    producto = {
                        "id": datetime.now().strftime("%Y%m%d_%H%M%S"),
                        "nombre": nombre,
                        "precio": precio,
                        "categoria": categoria,
                        "descripcion": descripcion,
                        "estado": estado,
                        "tiempo_prep": tiempo_prep,
                        "disponibilidad_dias": dias_semana,
                        "hora_inicio": hora_inicio.strftime("%H:%M"),
                        "hora_fin": hora_fin.strftime("%H:%M"),
                        "imagenes": rutas_imagenes,
                        "stock": stock,
                        "calorias": calorias,
                        "ingredientes": ingredientes,
                        "alergenos": alergenos,
                        "fecha_creacion": datetime.now().isoformat()
                    }
                    
                    # Cargar productos existentes
                    productos = load_json_data("data/productos/productos.json")
                    productos.append(producto)
                    
                    # Guardar productos
                    save_json_data(productos, "data/productos/productos.json")
                    
                    st.success(f"✅ Producto '{nombre}' guardado exitosamente!")
                    st.rerun()
                else:
                    st.error("❌ Por favor completa los campos obligatorios (*).")
    
    with tab2:
        productos = load_json_data("data/productos/productos.json")
        
        if productos:
            st.subheader(f"📊 Productos Registrados ({len(productos)})")
            
            # Filtros
            col_filtro1, col_filtro2, col_filtro3 = st.columns(3)
            with col_filtro1:
                filtro_categoria = st.selectbox("Filtrar por Categoría", 
                    ["Todos"] + list(set([p["categoria"] for p in productos])))
            with col_filtro2:
                filtro_estado = st.selectbox("Filtrar por Estado", 
                    ["Todos", "Activo", "Inactivo", "Agotado"])
            with col_filtro3:
                orden = st.selectbox("Ordenar por", ["Fecha ↓", "Fecha ↑", "Precio ↓", "Precio ↑", "Nombre"])
            
            # Aplicar filtros
            productos_filtrados = productos.copy()
            if filtro_categoria != "Todos":
                productos_filtrados = [p for p in productos_filtrados if p["categoria"] == filtro_categoria]
            if filtro_estado != "Todos":
                productos_filtrados = [p for p in productos_filtrados if p["estado"] == filtro_estado]
            
            # Aplicar orden
            if orden == "Precio ↓":
                productos_filtrados.sort(key=lambda x: x["precio"], reverse=True)
            elif orden == "Precio ↑":
                productos_filtrados.sort(key=lambda x: x["precio"])
            elif orden == "Nombre":
                productos_filtrados.sort(key=lambda x: x["nombre"])
            
            # Mostrar productos
            for i, producto in enumerate(productos_filtrados):
                with st.container():
                    col1, col2, col3 = st.columns([2, 4, 1])
                    
                    with col1:
                        if producto.get("imagenes"):
                            try:
                                st.image(producto["imagenes"][0], width=150)
                            except:
                                st.write("🖼️ Sin imagen")
                        else:
                            st.write("🖼️ Sin imagen")
                    
                    with col2:
                        st.write(f"**{producto['nombre']}** - ${producto['precio']:.2f}")
                        st.write(f"📂 {producto['categoria']} | 🔄 {producto['estado']}")
                        st.write(f"📝 {producto['descripcion'][:100]}...")
                        
                        # Mostrar días disponibles
                        dias_activos = [dia.title() for dia, activo in producto.get('disponibilidad_dias', {}).items() if activo]
                        if dias_activos:
                            st.write(f"📅 **Disponible:** {', '.join(dias_activos)}")
                            st.write(f"🕐 **Horario:** {producto.get('hora_inicio', '00:00')} - {producto.get('hora_fin', '23:59')}")
                    
                    with col3:
                        if st.button("🗑️ Eliminar", key=f"del_prod_{i}"):
                            productos.remove(producto)
                            save_json_data(productos, "data/productos/productos.json")
                            st.rerun()
                
                st.divider()
        else:
            st.info("📝 No hay productos registrados. ¡Agrega tu primer producto!")

# ========================================
# GESTIÓN DE BRIEF Y REFERENCIAS
# ========================================

def render_brief():
    st.header("📋 Brief y Referencias de Marca")
    
    tab1, tab2, tab3 = st.tabs(["📝 Brief de Campaña", "📁 Referencias", "📚 Historial"])
    
    with tab1:
        st.subheader("Crear Brief de Campaña")
        
        with st.form("brief_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                nombre_campana = st.text_input("🎯 Nombre de la Campaña *")
                cliente = st.text_input("🏢 Cliente/Marca *")
                audiencia = st.text_area("👥 Audiencia Objetivo *")
                objetivos = st.text_area("🎯 Objetivos de la Campaña *")
                
            with col2:
                presupuesto = st.number_input("💰 Presupuesto", min_value=0.0, format="%.2f")
                fecha_inicio = st.date_input("📅 Fecha de Inicio")
                fecha_fin = st.date_input("📅 Fecha de Fin")
                canales = st.multiselect("📢 Canales de Comunicación", 
                    ["Instagram", "Facebook", "LinkedIn", "Twitter", "TikTok", "YouTube", 
                     "Email", "WhatsApp", "Web", "Print", "Radio", "TV"])
            
            mensaje_clave = st.text_area("💬 Mensaje Clave *")
            tono = st.selectbox("🎨 Tono de Comunicación", 
                ["Profesional", "Casual", "Divertido", "Inspirador", "Urgente", "Educativo", "Emocional"])
            
            # KPIs y métricas
            st.subheader("📊 KPIs y Métricas")
            col_kpi1, col_kpi2 = st.columns(2)
            with col_kpi1:
                kpi_alcance = st.number_input("👁️ Alcance Objetivo", min_value=0)
                kpi_engagement = st.number_input("💝 Engagement Rate (%)", min_value=0.0, max_value=100.0)
            with col_kpi2:
                kpi_conversiones = st.number_input("🔄 Conversiones Objetivo", min_value=0)
                kpi_costo = st.number_input("💸 CPA Objetivo", min_value=0.0, format="%.2f")
            
            # Competencia
            competencia = st.text_area("🏆 Análisis de Competencia")
            notas = st.text_area("📝 Notas Adicionales")
            
            submitted_brief = st.form_submit_button("💾 Guardar Brief", type="primary")
            
            if submitted_brief:
                if nombre_campana and cliente and audiencia and objetivos and mensaje_clave:
                    brief = {
                        "id": datetime.now().strftime("%Y%m%d_%H%M%S"),
                        "nombre_campana": nombre_campana,
                        "cliente": cliente,
                        "audiencia": audiencia,
                        "objetivos": objetivos,
                        "presupuesto": presupuesto,
                        "fecha_inicio": str(fecha_inicio),
                        "fecha_fin": str(fecha_fin),
                        "canales": canales,
                        "mensaje_clave": mensaje_clave,
                        "tono": tono,
                        "kpis": {
                            "alcance": kpi_alcance,
                            "engagement": kpi_engagement,
                            "conversiones": kpi_conversiones,
                            "cpa": kpi_costo
                        },
                        "competencia": competencia,
                        "notas": notas,
                        "fecha_creacion": datetime.now().isoformat()
                    }
                    
                    briefs = load_json_data("data/briefs/briefs.json")
                    briefs.append(brief)
                    save_json_data(briefs, "data/briefs/briefs.json")
                    
                    st.success(f"✅ Brief '{nombre_campana}' guardado exitosamente!")
                    st.rerun()
                else:
                    st.error("❌ Por favor completa los campos obligatorios (*).")
    
    with tab2:
        st.subheader("📁 Archivos de Referencia")
        
        col_ref1, col_ref2, col_ref3 = st.columns(3)
        
        with col_ref1:
            st.write("**🎨 PowerPoint**")
            ppt_files = st.file_uploader("Subir PPT", type=['ppt', 'pptx'], 
                accept_multiple_files=True, key="ppt_ref")
            if ppt_files:
                for file in ppt_files:
                    save_uploaded_file(file, "uploads/powerpoint")
                st.success("✅ Archivos PPT guardados")
        
        with col_ref2:
            st.write("**🎯 Diseños Canva**")
            canva_files = st.file_uploader("Subir diseños", type=['pdf', 'png', 'jpg', 'jpeg'], 
                accept_multiple_files=True, key="canva_ref")
            if canva_files:
                for file in canva_files:
                    save_uploaded_file(file, "uploads/canva")
                st.success("✅ Diseños guardados")
        
        with col_ref3:
            st.write("**📋 Brand Guidelines**")
            brand_files = st.file_uploader("Subir guías", type=['pdf', 'doc', 'docx', 'png', 'jpg'], 
                accept_multiple_files=True, key="brand_ref")
            if brand_files:
                for file in brand_files:
                    save_uploaded_file(file, "uploads/brand_guidelines")
                st.success("✅ Guías guardadas")
        
        # Mostrar archivos existentes
        st.subheader("📂 Archivos Guardados")
        
        folders = {
            "PowerPoint": "uploads/powerpoint",
            "Canva": "uploads/canva", 
            "Brand Guidelines": "uploads/brand_guidelines"
        }
        
        for folder_name, folder_path in folders.items():
            if os.path.exists(folder_path):
                files = os.listdir(folder_path)
                if files:
                    with st.expander(f"{folder_name} ({len(files)} archivos)"):
                        for file in files:
                            st.write(f"📄 {file}")
    
    with tab3:
        briefs = load_json_data("data/briefs/briefs.json")
        
        if briefs:
            st.subheader(f"📚 Historial de Briefs ({len(briefs)})")
            
            for brief in reversed(briefs[-5:]):  # Mostrar últimos 5
                with st.expander(f"🎯 {brief['nombre_campana']} - {brief['cliente']}"):
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write(f"**Audiencia:** {brief['audiencia']}")
                        st.write(f"**Canales:** {', '.join(brief['canales'])}")
                        st.write(f"**Presupuesto:** ${brief['presupuesto']:,.2f}")
                    with col2:
                        st.write(f"**Tono:** {brief['tono']}")
                        st.write(f"**Fecha:** {brief['fecha_inicio']} - {brief['fecha_fin']}")
                    st.write(f"**Mensaje Clave:** {brief['mensaje_clave']}")
        else:
            st.info("📝 No hay briefs guardados.")

# ========================================
# GESTIÓN DE PROMOCIONES
# ========================================

def render_promociones():
    st.header("🎉 Gestión de Promociones")
    
    tab1, tab2 = st.tabs(["➕ Nueva Promoción", "🎫 Ver Promociones"])
    
    with tab1:
        st.subheader("Crear Nueva Promoción")
        
        with st.form("promocion_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                nombre_promo = st.text_input("🏷️ Nombre de la Promoción *")
                tipo_promo = st.selectbox("📊 Tipo de Promoción", 
                    ["Descuento Porcentaje", "Descuento Fijo", "2x1", "Cupón", "Envío Gratis", "Combo"])
                valor_descuento = st.number_input("💰 Valor del Descuento", min_value=0.0, format="%.2f")
                codigo_cupon = st.text_input("🎫 Código del Cupón", placeholder="Ej: DESCUENTO20")
                
            with col2:
                fecha_inicio_promo = st.date_input("📅 Fecha de Inicio")
                fecha_fin_promo = st.date_input("📅 Fecha de Fin")
                usos_maximos = st.number_input("🔢 Usos Máximos", min_value=1, value=100)
                monto_minimo = st.number_input("💵 Compra Mínima", min_value=0.0, format="%.2f")
            
            descripcion_promo = st.text_area("📝 Descripción de la Promoción *")
            
            # Productos aplicables
            productos = load_json_data("data/productos/productos.json")
            if productos:
                productos_nombres = [p["nombre"] for p in productos]
                productos_aplicables = st.multiselect("🛍️ Productos Aplicables", 
                    ["Todos los productos"] + productos_nombres)
            else:
                productos_aplicables = []
                st.info("📝 No hay productos para aplicar la promoción.")
            
            # Configuración adicional
            with st.expander("⚙️ Configuración Avanzada"):
                col_config1, col_config2 = st.columns(2)
                with col_config1:
                    activa = st.checkbox("✅ Promoción Activa", value=True)
                    acumulable = st.checkbox("🔄 Acumulable con otras promociones")
                with col_config2:
                    solo_nuevos = st.checkbox("🆕 Solo para nuevos clientes")
                    notificar = st.checkbox("📧 Enviar notificación")
            
            terms_conditions = st.text_area("📋 Términos y Condiciones")
            
            submitted_promo = st.form_submit_button("💾 Guardar Promoción", type="primary")
            
            if submitted_promo:
                if nombre_promo and descripcion_promo and codigo_cupon:
                    promocion = {
                        "id": datetime.now().strftime("%Y%m%d_%H%M%S"),
                        "nombre": nombre_promo,
                        "tipo": tipo_promo,
                        "valor_descuento": valor_descuento,
                        "codigo_cupon": codigo_cupon.upper(),
                        "fecha_inicio": str(fecha_inicio_promo),
                        "fecha_fin": str(fecha_fin_promo),
                        "usos_maximos": usos_maximos,
                        "usos_actuales": 0,
                        "monto_minimo": monto_minimo,
                        "descripcion": descripcion_promo,
                        "productos_aplicables": productos_aplicables,
                        "activa": activa,
                        "acumulable": acumulable,
                        "solo_nuevos": solo_nuevos,
                        "notificar": notificar,
                        "terms_conditions": terms_conditions,
                        "fecha_creacion": datetime.now().isoformat()
                    }
                    
                    promociones = load_json_data("data/promociones/promociones.json")
                    promociones.append(promocion)
                    save_json_data(promociones, "data/promociones/promociones.json")
                    
                    st.success(f"✅ Promoción '{nombre_promo}' creada exitosamente!")
                    st.success(f"🎫 Código de cupón: **{codigo_cupon.upper()}**")
                    st.rerun()
                else:
                    st.error("❌ Por favor completa los campos obligatorios (*).")
    
    with tab2:
        promociones = load_json_data("data/promociones/promociones.json")
        
        if promociones:
            st.subheader(f"🎫 Promociones Activas ({len([p for p in promociones if p.get('activa', False)])})")
            
            # Filtros
            col_filtro_p1, col_filtro_p2 = st.columns(2)
            with col_filtro_p1:
                filtro_estado_promo = st.selectbox("Estado", ["Todas", "Activas", "Inactivas"])
            with col_filtro_p2:
                filtro_tipo_promo = st.selectbox("Tipo", 
                    ["Todos"] + list(set([p["tipo"] for p in promociones])))
            
            for i, promo in enumerate(promociones):
                # Aplicar filtros
                if filtro_estado_promo == "Activas" and not promo.get("activa", False):
                    continue
                if filtro_estado_promo == "Inactivas" and promo.get("activa", False):
                    continue
                if filtro_tipo_promo != "Todos" and promo["tipo"] != filtro_tipo_promo:
                    continue
                
                with st.container():
                    col1, col2, col3 = st.columns([3, 2, 1])
                    
                    with col1:
                        estado_emoji = "✅" if promo.get("activa", False) else "❌"
                        st.write(f"**{estado_emoji} {promo['nombre']}**")
                        st.write(f"🎫 **Código:** `{promo['codigo_cupon']}`")
                        st.write(f"📝 {promo['descripcion']}")
                        
                    with col2:
                        st.write(f"💰 **Descuento:** {promo['valor_descuento']}")
                        st.write(f"📅 **Vigencia:** {promo['fecha_inicio']} - {promo['fecha_fin']}")
                        st.write(f"🔢 **Usos:** {promo.get('usos_actuales', 0)}/{promo['usos_maximos']}")
                    
                    with col3:
                        if st.button("🗑️", key=f"del_promo_{i}"):
                            promociones.remove(promo)
                            save_json_data(promociones, "data/promociones/promociones.json")
                            st.rerun()
                        
                        if promo.get("activa", False):
                            if st.button("⏸️", key=f"pause_promo_{i}"):
                                promo["activa"] = False
                                save_json_data(promociones, "data/promociones/promociones.json")
                                st.rerun()
                        else:
                            if st.button("▶️", key=f"play_promo_{i}"):
                                promo["activa"] = True
                                save_json_data(promociones, "data/promociones/promociones.json")
                                st.rerun()
                
                st.divider()
        else:
            st.info("📝 No hay promociones creadas. ¡Crea tu primera promoción!")

# ========================================
# DASHBOARD PRINCIPAL
# ========================================

def render_dashboard():
    st.header("📊 Dashboard Principal")
    
    col1, col2, col3, col4 = st.columns(4)
    
    # Cargar datos
    productos = load_json_data("data/productos/productos.json")
    briefs = load_json_data("data/briefs/briefs.json")
    promociones = load_json_data("data/promociones/promociones.json")
    
    with col1:
        st.metric("🛍️ Productos", len(productos))
        productos_activos = len([p for p in productos if p.get("estado") == "Activo"])
        st.write(f"✅ {productos_activos} activos")
        
    with col2:
        st.metric("📋 Briefs", len(briefs))
        if briefs:
            st.write(f"📅 Último: {briefs[-1]['nombre_campana']}")
        
    with col3:
        st.metric("🎉 Promociones", len(promociones))
        promos_activas = len([p for p in promociones if p.get("activa", False)])
        st.write(f"✅ {promos_activas} activas")
        
    with col4:
        # Calcular valor total de productos
        valor_total = sum([p.get("precio", 0) for p in productos])
        st.metric("💰 Valor Inventario", f"${valor_total:,.2f}")
    
    st.divider()
    
    # Resumen reciente
    if productos or briefs or promociones:
        st.subheader("📈 Actividad Reciente")
        
        col_recent1, col_recent2 = st.columns(2)
        
        with col_recent1:
            if productos:
                st.write("**🛍️ Últimos Productos:**")
                for prod in productos[-3:]:
                    st.write(f"• {prod['nombre']} - ${prod['precio']}")
        
        with col_recent2:
            if promociones:
                st.write("**🎉 Promociones Activas:**")
                promos_activas = [p for p in promociones if p.get("activa", False)]
                for promo in promos_activas[-3:]:
                    st.write(f"• {promo['nombre']} - {promo['codigo_cupon']}")

# ========================================
# NAVEGACIÓN PRINCIPAL
# ========================================

def main():
    # CSS personalizado
    st.markdown("""
        <style>
        .main-header {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            padding: 1rem;
            border-radius: 10px;
            color: white;
            text-align: center;
            margin-bottom: 2rem;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Header principal
    st.markdown("""
        <div class="main-header">
            <h1>🚀 Marketing Manager Pro</h1>
            <p>Sistema Completo de Gestión de Marketing</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Sidebar de navegación
    with st.sidebar:
        st.title("🧭 Navegación")
        
        page = st.selectbox("Selecciona una sección:", [
            "📊 Dashboard",
            "🛍️ Productos", 
            "📋 Brief & Referencias",
            "🎉 Promociones"
        ])
        
        st.divider()
        
        # Info del sistema
        st.write("**ℹ️ Sistema Info:**")