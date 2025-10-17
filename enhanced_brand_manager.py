import streamlit as st
import os
import json
from datetime import datetime
import zipfile
import io
from pathlib import Path

class BrandManager:
    def __init__(self):
        self.base_path = "brand_assets"
        self.ensure_directories()
        
    def ensure_directories(self):
        """Crear directorios base si no existen"""
        directories = [
            f"{self.base_path}/powerpoint",
            f"{self.base_path}/canva_designs", 
            f"{self.base_path}/brand_guidelines",
            f"{self.base_path}/temp"
        ]
        for dir_path in directories:
            os.makedirs(dir_path, exist_ok=True)
    
    def save_uploaded_file(self, uploaded_file, category):
        """Guardar archivo subido en la categoría correspondiente"""
        if uploaded_file is not None:
            # Crear nombre de archivo con timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{uploaded_file.name}"
            file_path = os.path.join(self.base_path, category, filename)
            
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            return file_path
        return None
    
    def get_files_by_category(self, category):
        """Obtener lista de archivos por categoría"""
        category_path = os.path.join(self.base_path, category)
        if os.path.exists(category_path):
            return [f for f in os.listdir(category_path) if os.path.isfile(os.path.join(category_path, f))]
        return []
    
    def delete_file(self, category, filename):
        """Eliminar archivo específico"""
        file_path = os.path.join(self.base_path, category, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

def render_file_manager():
    """Renderizar el gestor de archivos de referencia"""
    st.subheader("📁 Archivos de Referencia de Marca")
    
    brand_manager = BrandManager()
    
    # Pestañas para diferentes categorías
    tab1, tab2, tab3 = st.tabs(["🎨 PowerPoint", "🎯 Diseños Canva", "📋 Brand Guidelines"])
    
    with tab1:
        st.write("**Presentaciones PowerPoint de Campañas**")
        
        # Subir archivo PowerPoint
        ppt_file = st.file_uploader(
            "Subir presentación PowerPoint", 
            type=['ppt', 'pptx'],
            key="ppt_uploader"
        )
        
        if ppt_file and st.button("Guardar PowerPoint", key="save_ppt"):
            file_path = brand_manager.save_uploaded_file(ppt_file, "powerpoint")
            if file_path:
                st.success(f"✅ Archivo guardado: {ppt_file.name}")
                st.rerun()
        
        # Mostrar archivos existentes
        ppt_files = brand_manager.get_files_by_category("powerpoint")
        if ppt_files:
            st.write("**Archivos PowerPoint guardados:**")
            for i, filename in enumerate(ppt_files):
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(f"📄 {filename}")
                with col2:
                    if st.button("🗑️", key=f"del_ppt_{i}"):
                        if brand_manager.delete_file("powerpoint", filename):
                            st.success("Archivo eliminado")
                            st.rerun()
    
    with tab2:
        st.write("**Diseños y Assets de Canva**")
        
        # Subir archivo Canva (PDF, PNG, JPG)
        canva_file = st.file_uploader(
            "Subir diseño de Canva", 
            type=['pdf', 'png', 'jpg', 'jpeg'],
            key="canva_uploader"
        )
        
        if canva_file and st.button("Guardar Diseño", key="save_canva"):
            file_path = brand_manager.save_uploaded_file(canva_file, "canva_designs")
            if file_path:
                st.success(f"✅ Diseño guardado: {canva_file.name}")
                st.rerun()
        
        # Mostrar archivos existentes
        canva_files = brand_manager.get_files_by_category("canva_designs")
        if canva_files:
            st.write("**Diseños guardados:**")
            for i, filename in enumerate(canva_files):
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(f"🎨 {filename}")
                    # Previsualizar imágenes
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                        file_path = os.path.join("brand_assets/canva_designs", filename)
                        try:
                            st.image(file_path, width=200)
                        except:
                            st.write("No se pudo cargar la previsualización")
                with col2:
                    if st.button("🗑️", key=f"del_canva_{i}"):
                        if brand_manager.delete_file("canva_designs", filename):
                            st.success("Archivo eliminado")
                            st.rerun()
    
    with tab3:
        st.write("**Guías de Marca y Assets Corporativos**")
        
        # Subir brand guidelines
        brand_file = st.file_uploader(
            "Subir guía de marca", 
            type=['pdf', 'doc', 'docx', 'png', 'jpg'],
            key="brand_uploader"
        )
        
        if brand_file and st.button("Guardar Guía", key="save_brand"):
            file_path = brand_manager.save_uploaded_file(brand_file, "brand_guidelines")
            if file_path:
                st.success(f"✅ Guía guardada: {brand_file.name}")
                st.rerun()
        
        # Mostrar archivos existentes
        brand_files = brand_manager.get_files_by_category("brand_guidelines")
        if brand_files:
            st.write("**Guías de marca guardadas:**")
            for i, filename in enumerate(brand_files):
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(f"📋 {filename}")
                with col2:
                    if st.button("🗑️", key=f"del_brand_{i}"):
                        if brand_manager.delete_file("brand_guidelines", filename):
                            st.success("Archivo eliminado")
                            st.rerun()

def render_brief_tab():
    """Renderizar la pestaña completa de Brief con archivos"""
    
    # Sección de archivos de referencia
    with st.expander("📁 Archivos de Referencia", expanded=True):
        render_file_manager()
    
    st.divider()
    
    # Sección de brief existente (agregar aquí el contenido actual del brief)
    with st.expander("📝 Brief de Campaña", expanded=True):
        st.write("**Información del Brief:**")
        
        col1, col2 = st.columns(2)
        with col1:
            campaign_name = st.text_input("Nombre de la campaña")
            target_audience = st.text_input("Audiencia objetivo")
            campaign_goals = st.text_area("Objetivos de la campaña")
        
        with col2:
            budget = st.number_input("Presupuesto", min_value=0)
            timeline = st.date_input("Fecha límite")
            channels = st.multiselect(
                "Canales de distribución",
                ["Instagram", "Facebook", "LinkedIn", "Twitter", "Email", "Web", "Print"]
            )
        
        # Mensaje clave
        key_message = st.text_area("Mensaje clave de la campaña")
        
        # Tono y estilo
        tone = st.selectbox(
            "Tono de comunicación",
            ["Profesional", "Casual", "Divertido", "Inspirador", "Urgente", "Educativo"]
        )
        
        if st.button("💾 Guardar Brief"):
            brief_data = {
                "campaign_name": campaign_name,
                "target_audience": target_audience,
                "campaign_goals": campaign_goals,
                "budget": budget,
                "timeline": str(timeline),
                "channels": channels,
                "key_message": key_message,
                "tone": tone,
                "created_at": datetime.now().isoformat()
            }
            
            # Guardar brief como JSON
            brief_path = "brand_assets/briefs"
            os.makedirs(brief_path, exist_ok=True)
            
            with open(f"{brief_path}/brief_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", "w") as f:
                json.dump(brief_data, f, indent=2)
            
            st.success("✅ Brief guardado exitosamente")

def main():
    st.set_page_config(
        page_title="Brand Manager - Marketing Chat",
        page_icon="🎯",
        layout="wide"
    )
    
    st.title("🎯 Brand Manager - Marketing Chat")
    
    # Menú lateral
    with st.sidebar:
        st.header("🔧 Herramientas")
        selected_tab = st.selectbox(
            "Seleccionar sección:",
            ["Brief & Referencias", "Análisis", "Campañas", "Configuración"]
        )
    
    # Contenido principal basado en selección
    if selected_tab == "Brief & Referencias":
        render_brief_tab()
    elif selected_tab == "Análisis":
        st.write("🔍 Sección de análisis (por implementar)")
    elif selected_tab == "Campañas":
        st.write("📈 Gestión de campañas (por implementar)")
    else:
        st.write("⚙️ Configuración (por implementar)")

if __name__ == "__main__":
    main()