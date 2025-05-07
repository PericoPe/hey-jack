import React, { useState } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Typography,
  Paper
} from '@mui/material';

/**
 * Componente SelectElement reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del select
 * @param {Array} props.options - Opciones disponibles para seleccionar
 * @param {string} props.value - Valor seleccionado
 * @param {function} props.onChange - Función para manejar cambios
 * @param {string} props.variant - Variante del select (outlined, filled, standard)
 * @param {Object} props.sx - Estilos adicionales
 * @param {boolean} props.showTitle - Mostrar título sobre el select
 * @param {string} props.title - Título del select
 */
const SelectElement = ({ 
  label = "Seleccionar", 
  options = [], 
  value = "", 
  onChange, 
  variant = "outlined", 
  sx = {}, 
  showTitle = false,
  title = "Seleccione una opción"
}) => {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, ...sx }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {title}
        </Typography>
      )}
      <FormControl fullWidth variant={variant}>
        <InputLabel id={`select-label-${label.replace(/\s+/g, '-').toLowerCase()}`}>
          {label}
        </InputLabel>
        <Select
          labelId={`select-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
          id={`select-${label.replace(/\s+/g, '-').toLowerCase()}`}
          value={selectedValue}
          label={label}
          onChange={handleChange}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default SelectElement;
