import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MediaFile } from '../components/MediaPicker';

export const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  price: z.string()
    .min(1, 'El precio es obligatorio')
    .refine((val) => !isNaN(Number(val)), 'El precio debe ser un número')
    .refine((val) => Number(val) > 0, 'El precio debe ser un número positivo'),
  offerType: z.enum(['Descuento en dinero', 'Descuento en porcentaje']),
  discountValue: z.string()
    .min(1, 'El descuento es obligatorio')
    .refine((val) => !isNaN(Number(val)), 'El descuento debe ser un número')
    .refine((val) => Number(val) >= 0, 'El descuento no puede ser negativo'),
  multimedia: z.array(z.any()).min(1, 'Debes subir al menos un archivo multimedia'),
  startDate: z.date(),
  endDate: z.date(),
}).superRefine((data, ctx) => {
  const priceNum = Number(data.price);
  const discountNum = Number(data.discountValue);

  if (!isNaN(priceNum) && !isNaN(discountNum)) {
    if (data.offerType === 'Descuento en porcentaje' && discountNum > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El porcentaje de descuento no puede ser mayor a 100%',
        path: ['discountValue'],
      });
    }
    if (data.offerType === 'Descuento en dinero' && discountNum > priceNum) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El descuento no puede ser mayor al precio original',
        path: ['discountValue'],
      });
    }
  }

  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
      path: ['endDate'],
    });
  }
});

export type FormValues = z.infer<typeof formSchema>;

const API_URL = Platform.select({
  ios: 'http://localhost:3000/api/items',
  android: 'http://10.0.2.2:3000/api/items',
  default: 'http://localhost:3000/api/items',
});

export function useOfferForm() {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      offerType: 'Descuento en dinero',
      discountValue: '',
      multimedia: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const { reset, setValue } = formMethods;

  const handleSelectOfferType = (type: 'Descuento en dinero' | 'Descuento en porcentaje') => {
    setValue('offerType', type, { shouldValidate: true });
    setValue('discountValue', '', { shouldValidate: false });
    setShowDropdown(false);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('offerType', data.offerType);
      formData.append('discountValue', data.discountValue);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());

      data.multimedia.forEach((file: MediaFile, index: number) => {
        const fileUri = file.uri;
        const filename = file.name || `file-${index}.${file.type === 'video' ? 'mp4' : 'jpg'}`;
        const type = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

        // Native uploader bridge object format
        formData.append('multimedia', {
          uri: fileUri,
          type,
          name: filename,
        } as any);
      });

      console.log('Enviando datos (XHR) a:', API_URL);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_URL!);

      xhr.onload = () => {
        setLoading(false);
        try {
          const responseData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setSuccessMessage('¡Item de oferta creado exitosamente en el servidor!');
            Alert.alert('Éxito', 'El formulario ha sido procesado y guardado correctamente.');
            reset();
          } else {
            const errorMsg = responseData.message || 'Error desconocido del servidor';
            Alert.alert('Error de Servidor', errorMsg);
          }
        } catch (parseError) {
          console.error('Error al parsear respuesta del servidor:', parseError);
          Alert.alert('Error', 'El servidor devolvió una respuesta de formato no válido.');
        }
      };

      xhr.onerror = (e) => {
        setLoading(false);
        console.error('Error de red al enviar el formulario (XHR):', e);
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor API. Asegúrate de que el backend está corriendo y tu dirección IP es correcta.'
        );
      };

      xhr.send(formData);
    } catch (error) {
      setLoading(false);
      console.error('Error de red al enviar el formulario:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor API. Asegúrate de que el backend está corriendo y tu dirección IP es correcta.'
      );
    }
  };

  return {
    ...formMethods,
    loading,
    successMessage,
    showDropdown,
    setShowDropdown,
    handleSelectOfferType,
    onSubmit,
  };
}
