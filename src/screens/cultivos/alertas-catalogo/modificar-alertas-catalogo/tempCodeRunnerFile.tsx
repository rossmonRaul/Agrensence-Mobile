const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        const fincaNombre = item.label;
        
        setSelectedFinca(fincaNombre); // Guardar el nombre de la finca seleccionada
        setSelectedFinca(item.value);
        updateFormulario('idFinca', item.value);
        updateFormulario('nombreFinca', fincaNombre); // Guardar también el nombre de la finca

        obtenerParcelasPorFinca(fincaId);
        updateFormulario('idParcela', '');
    };