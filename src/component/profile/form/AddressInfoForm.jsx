'use client';
import { HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FormAccordion from './FormAccordion';
import UnderlinedInput from '@/components/common/form/underlined-input/UnderlinedInput';
import api from '@/services/api';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import UnderlinedSelect from '@/components/common/form/underlined-input/UnderlinedSelect';
import { useProfile } from '@/contexts/ProfileContext';
import { formatNpwp } from '@/utils/numberFormatterUtils';
import UnderlinedInputSearchSelect from '@/components/common/form/underlined-input/UnderlinedInputSearchSelect';
import FileUpload from '@/components/common/form/file-upload/FileUpload';
import Swal from 'sweetalert2';

const AddressInfoForm = () => {
  const { data: session } = useSession();
  const {
    profileData,
    profileDataIsLoading,
    profileDataIsError,
    submitProfileFormMutation,
    validationErrorMsg,
  } = useProfile();

  const {
    data: purposeData,
    isLoading: purposeDataIsLoading,
    isError: purposeDataIsError,
  } = useQuery({
    queryKey: ['purposeMasterData', session?.user?.data?.customer?.customer_no],
    queryFn: () =>
      api.buyingPurpose.fetchPurpose({
        token: session.user.data.token,
      }),
  });

  const fetchAllCities = async () => {
    let allCities = [];
    let page = 1;
    let moreData = true;
    let perPage = 50;

    while (moreData) {
      const response = await api.location.fetchCities(
        { page, per_page: perPage },
        session.user.data.token
      );
      const data = response.data;
      const totalPages = Math.ceil((data?.pagination?.total || 0) / perPage);

      if (totalPages >= page) {
        allCities = [...allCities, ...data.pagination.collection];
        page += 1;
      } else {
        moreData = false; // stop when there's no more data
      }
    }
    return allCities;
  };

  const {
    data: cityData,
    isLoading: cityDataIsLoading,
    isError: cityDataIsError,
  } = useQuery({
    queryKey: ['cityMasterData', session?.user?.data?.customer?.customer_no],
    queryFn: fetchAllCities,
  });

  const getProvinceId = (cityId) => {
    const filterCity = cityData?.find((item) => item.KOTA_ID === cityId);
    return filterCity ? filterCity.PROVINSI_ID : null;
  };

  // state for form fields
  const [form, setForm] = useState({
    address: '',
    npwp: '',
    purpose: '',
    city: '',
    province: '',
    ktp: '',
  });
  const [prevForm, setPrevForm] = useState({ ...form }); // to check if dirty

  // state for field errors and loading indicators
  const [errors, setErrors] = useState({
    address: '',
    npwp: '',
    purpose: '',
    city: '',
    ktp: '',
  });

  const [loading, setLoading] = useState({
    address: false,
    npwp: false,
    city: false,
    purpose: false,
  });

  // validation functions
  const validateAddress = (address) => {
    if (!address) return 'Alamat harus diisi';
    return '';
  };

  const validateKTP = (ktp) => {
    if (!ktp) return 'KTP harus diunggah';

    if (ktp && ktp.size > 2 * 1024 * 1024) {
      return 'Ukuran file tidak boleh lebih dari 2MB';
    }
    return '';
  };

  const validateNpwp = (npwp) => {
    if (!npwp) return 'NPWP harus diisi';

    const regex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
    if (!regex.test(npwp)) {
      return 'Format NPWP tidak valid';
    }
    return '';
  };

  const validateCity = (city) => {
    if (!city) return 'Kota harus dipilih!';
    return '';
  };

  const validatePurpose = (purpose) => {
    if (!purpose) return 'Tujuan Pembelian harus dipilih!';
    return '';
  };

  const handleChangeUploadImg = async (e) => {
    if (e.target) {
      const { name, type, files } = e.target;

      if (type === 'file') {
        const file = files[0];
        setForm((prev) => ({ ...prev, [name]: file }));

        const formData = new FormData();
        formData.append('file_ktp', file);

        try {
          await submitProfileFormMutation.mutateAsync(formData);
          Swal.fire({
            text: 'Foto KTP berhasil diunggah',
            icon: 'success',
          });
        } catch (error) {
          Swal.fire({
            text: 'Foto KTP gagal diunggah',
            icon: 'error',
          });
        }
      }
    }
  };

  const handleChange = (e) => {
    // check if the event is from a standard input field
    if (e.target) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // this only send single field now
  const handleSubmitField = async (field) => {
    const formData = new FormData();
    // formData.append(field, form[field]);
    switch (field) {
      case 'address':
        formData.append('alamat', form?.address);
        break;
      case 'npwp':
        formData.append('npwp', form?.npwp);
        break;
      case 'city':
        formData.append('kota', form?.city);
        formData.append('provinsi', form?.province);
        break;
      case 'purpose':
        formData.append('tujuan_beli', form?.purpose);
        break;
      default:
        return;
    }

    // call API with only the updated field
    await submitProfileFormMutation.mutateAsync(formData);
  };

  // handle individual field submission with loading
  const handleBlur = async (field) => {
    let error = '';
    setLoading((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'address':
        error = validateAddress(form.address);
        break;
      case 'npwp':
        error = validateNpwp(form.npwp);
        break;
      case 'city':
        error = validateCity(form.city);
        break;
      case 'purpose':
        error = validatePurpose(form.purpose);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));

    if (!error && form[field] !== prevForm[field]) {
      try {
        await handleSubmitField(field); // this submit only the updated field
      } finally {
        setLoading((prev) => ({ ...prev, [field]: false }));
      }
    } else {
      setLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const [purposeOptions, setPurposeOptions] = useState([]);
  useEffect(() => {
    if (purposeData) {
      const options = purposeData?.data?.pagination?.collection?.map((opt) => ({
        name: opt?.TUJUAN_BELI_DESKRIPSI,
        value: opt?.TUJUAN_BELI_DESKRIPSI,
      }));
      setPurposeOptions(options);
    }
  }, [purposeData]);

  const [cityOptions, setCityOptions] = useState([]);
  useEffect(() => {
    if (cityData) {
      const options = cityData.map((opt) => ({
        name: opt.KOTA_NAMA,
        value: opt.KOTA_ID,
      }));
      setCityOptions(options);
    }
  }, [cityData]);

  useEffect(() => {
    if (profileData) {
      const { customer } = profileData?.data;
      const updatedForm = {
        address: customer?.alamat,
        city: customer?.kota_id,
        npwp: customer?.npwp,
        purpose: customer?.tujuan_beli,
      };
      setForm(updatedForm);
      setPrevForm(updatedForm);
    }
  }, [profileData]);

  return (
    <FormAccordion buttonText={'Alamat Domisili*'}>
      <VStack padding={3} gap={7}>
        <HStack width='full'>
          <UnderlinedInput
            inputName='address'
            inputType='text'
            inputLabel='Alamat Domisili'
            inputPlaceHolder='Isi alamat sesuai dengan permintaan'
            inputOnBlur={() => {
              handleBlur('address');
            }}
            inputOnChange={(e) => {
              handleChange(e);
            }}
            inputValue={form?.address || ''}
            inputError={errors?.address}
          />
          {loading.address && <Spinner />}
        </HStack>

        <HStack width='full'>
          <UnderlinedInputSearchSelect
            inputName='city'
            inputLabel='Kota'
            inputPlaceHolder='Pilih kota tempat Anda tinggal'
            inputSearchPlaceHolder='Ketik nama kota/kabupaten'
            inputValue={form?.city || ''}
            inputOptions={cityOptions}
            inputOptionIsLoading={cityDataIsLoading}
            inputOptionIsError={cityDataIsError}
            inputOnBlur={() => {
              handleBlur('city');
            }}
            inputOnChange={(e) => {
              // add province id auctomatically
              const provinceId = getProvinceId(e?.target?.value);
              setForm((prev) => ({ ...prev, province: provinceId }));
              handleChange(e);
            }}
            inputError={errors?.city}
          />
          {loading.city && <Spinner />}
        </HStack>

        <HStack width='full'>
          <UnderlinedSelect
            inputName='purpose'
            inputLabel='Tujuan Pembelian'
            inputPlaceHolder='Pilih tujuan pembelian Anda'
            inputValue={form?.purpose || ''}
            inputOptions={purposeOptions}
            inputOptionIsLoading={purposeDataIsLoading}
            inputOptionIsError={purposeDataIsError}
            inputOnBlur={() => {
              handleBlur('purpose');
            }}
            inputOnChange={(e) => {
              handleChange(e);
            }}
            inputError={errors?.purpose}
          />
          {loading.purpose && <Spinner />}
        </HStack>

        <HStack width='full'>
          <UnderlinedInput
            inputName='npwp'
            inputType='text'
            inputLabel='NPWP'
            inputPlaceHolder='Isi nomor NPWP Anda'
            inputOnBlur={() => {
              handleBlur('npwp');
            }}
            inputOnChange={(e) => {
              const value = e.target.value; // extract the value first
              const formattedValue = formatNpwp(value);
              const dupEvent = {
                target: {
                  name: e.target.name, // preserve the input's name
                  value: formattedValue, // set the formatted value
                },
              };
              handleChange(dupEvent);
            }}
            inputValue={form?.npwp || ''}
            inputError={errors?.npwp}
          />
          {loading.npwp && <Spinner />}
        </HStack>

        <HStack width='full'>
          <FileUpload
            onFileChange={(file) => {
              const error = validateKTP(file);
              if (error) {
                setErrors((prev) => ({ ...prev, ktp: error }));
              } else {
                setErrors((prev) => ({ ...prev, ktp: '' }));
                handleChangeUploadImg({
                  target: { name: 'ktp', files: [file], type: 'file' },
                });
              }
            }}
            buttonText='Upload KTP'
            inputError={errors?.ktp}
            initialImage={profileData?.data?.customer?.customer_ktp || ''}
          />
        </HStack>

        {/* validation error from BE */}
        {validationErrorMsg && (
          <Text fontSize={11} color={'red.100'} m={1}>
            {validationErrorMsg}
          </Text>
        )}
      </VStack>
    </FormAccordion>
  );
};

export default AddressInfoForm;
