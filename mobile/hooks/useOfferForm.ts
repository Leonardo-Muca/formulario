import { useState, useEffect } from 'react';
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

  const start = new Date(data.startDate.getFullYear(), data.startDate.getMonth(), data.startDate.getDate());
  const end = new Date(data.endDate.getFullYear(), data.endDate.getMonth(), data.endDate.getDate());

  if (start > end) {
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

export function useOfferForm(promoId?: string, onSuccess?: () => void) {
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

  // Fetch promotion data to populate the form if we are in Edit Mode
  useEffect(() => {
    if (promoId) {
      const loadPromoToEdit = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/${promoId}`);
          const result = await response.json();
          if (result.success && result.data) {
            const promo = result.data;
            reset({
              name: promo.name,
              description: promo.description,
              price: String(promo.price),
              offerType: promo.offerType,
              discountValue: String(promo.discountValue),
              multimedia: promo.multimedia, // Array of existing media files with urls
              startDate: new Date(promo.startDate),
              endDate: new Date(promo.endDate),
            });
          } else {
            Alert.alert('Error', 'No se pudo cargar la información de la oferta.');
          }
        } catch (error) {
          console.error('Error loading promo details:', error);
          Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
        } finally {
          setLoading(false);
        }
      };
      loadPromoToEdit();
    }
  }, [promoId, reset]);

  const handleSelectOfferType = (type: 'Descuento en dinero' | 'Descuento en porcentaje') => {
    setValue('offerType', type, { shouldValidate: true });
    setValue('discountValue', '', { shouldValidate: false });
    setShowDropdown(false);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setSuccessMessage(null);

    const isEditMode = !!promoId;
    const requestUrl = isEditMode ? `${API_URL}/${promoId}` : API_URL!;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('offerType', data.offerType);
      formData.append('discountValue', data.discountValue);
      formData.append('startDate', data.startDate.toISOString());
      formData.append('endDate', data.endDate.toISOString());

      // Separate existing files (with URL) from new uploads (local file pickups)
      const retainedFiles: any[] = [];
      const newUploads: any[] = [];

      data.multimedia.forEach((file: any) => {
        if (file.url) {
          retainedFiles.push(file);
        } else {
          newUploads.push(file);
        }
      });

      // Append existing files as JSON
      formData.append('existingMultimedia', JSON.stringify(retainedFiles));

      // Append new files
      newUploads.forEach((file: MediaFile, index: number) => {
        const fileUri = file.uri;
        const filename = file.name || `file-${index}.${file.type === 'video' ? 'mp4' : 'jpg'}`;
        const type = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

        formData.append('multimedia', {
          uri: fileUri,
          type,
          name: filename,
        } as any);
      });

      console.log(`Enviando datos (${method} XHR) a:`, requestUrl);

      const xhr = new XMLHttpRequest();
      xhr.open(method, requestUrl);

      xhr.onload = () => {
        setLoading(false);
        try {
          const responseData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setSuccessMessage(
              isEditMode
                ? '¡Item de oferta actualizado exitosamente!'
                : '¡Item de oferta creado exitosamente!'
            );
            Alert.alert(
              'Éxito',
              isEditMode
                ? 'La oferta ha sido actualizada correctamente.'
                : 'El formulario ha sido procesado y guardado correctamente.'
            );
            if (!isEditMode) {
              reset();
            }
            if (onSuccess) {
              onSuccess();
            }
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
          'No se pudo conectar con el servidor API. Asegúrate de que el backend está corriendo.'
        );
      };

      xhr.send(formData);
    } catch (error) {
      setLoading(false);
      console.error('Error de red al enviar el formulario:', error);
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar con el servidor API. Asegúrate de que el backend está corriendo.'
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
