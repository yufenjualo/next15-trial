'use client';
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FormAccordion from './FormAccordion';
import UnderlinedInput from '@/components/common/form/underlined-input/UnderlinedInput';
import api from '@/services/api';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import UnderlinedSelect from '@/components/common/form/underlined-input/UnderlinedSelect';
import { useProfile } from '@/contexts/ProfileContext';
import InfoToolTip from './InfoToolTip';

const BiodataForm = () => {
  const { data: session } = useSession();
  const {
    profileData,
    profileDataIsLoading,
    profileDataIsError,
    submitProfileFormMutation,
    validationErrorMsg,
  } = useProfile();

  const {
    data: jobData,
    isLoading: jobDataIsLoading,
    isError: jobDataIsError,
  } = useQuery({
    queryKey: ['jobMasterData', session?.user?.data?.customer?.customer_no],
    queryFn: () =>
      api.job.fetchJobs({
        token: session.user.data.token,
      }),
  });

  // state for form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    nik: '',
    job: '',
    gender: '',
    placeOfBirth: '',
    dateOfBirth: '',
  });
  const [prevForm, setPrevForm] = useState({ ...form }); // to check if dirty

  // state for field errors and loading indicators
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    nik: '',
    job: '',
    gender: '',
    placeOfBirth: '',
    dateOfBirth: '',
  });

  const [loading, setLoading] = useState({
    name: false,
    email: false,
    phone: false,
    nik: false,
    job: false,
    gender: false,
    placeOfBirth: false,
    dateOfBirth: false,
  });

  // validation functions
  const validateName = (name) => {
    if (!name) return 'Nama harus diisi';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email harus diisi';
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Email tidak valid';
    return '';
  };

  const validateNik = (nik) => {
    if (!nik) return 'NIK harus diisi';
    if (nik.length !== 16) return 'NIK harus 16 karakter';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Nomor HP harus diisi';

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) return 'Nomor HP hanya boleh mengandung angka';

    if (phone.length < 10)
      return 'nomor HP harus terdiri dari minimal 10 digit';
    if (phone.length > 15) return 'Nomor HP tidak boleh lebih dari 15 digit';

    return '';
  };

  const validateJob = (job) => {
    if (!job) return 'Pekerjaan harus diisi';
    return '';
  };

  const validatePlaceOfBirth = (placeOfBirth) => {
    if (!placeOfBirth) return 'Tempat Lahir harus diisi';
    return '';
  };

  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'Tanggal Lahir harus diisi';
    return '';
  };

  const validateGender = (gender) => {
    if (!gender) return 'Jenis Kelamin harus diisi';
    return '';
  };

  const handleChange = (e) => {
    // check if the event is from a standard input field
    if (e.target) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      // if the event is from radioGroup, e is the value directly
      const value = e;
      setForm((prev) => ({ ...prev, gender: value }));
    }
  };

  // this only send single field now
  const handleSubmitField = async (field) => {
    const formData = new FormData();

    switch (field) {
      case 'name':
        formData.append('fullname', form?.name?.toUpperCase());
        break;
      case 'email':
        formData.append('email', form?.email?.toUpperCase());
        break;
      case 'phone':
        formData.append('no_telp_pribadi', form?.phone);
        break;
      case 'nik':
        formData.append('no_ktp', form?.nik);
        break;
      case 'job':
        formData.append('pekerjaan', form?.job);
        break;
      case 'gender':
        formData.append('jenis_kelamin', form?.gender);
        break;
      case 'dateOfBirth':
        formData.append('tgl_lahir', form?.dateOfBirth);
        break;
      case 'placeOfBirth':
        formData.append('tempat_lahir', form?.placeOfBirth?.toUpperCase());
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
      case 'name':
        error = validateName(form.name);
        break;
      case 'email':
        error = validateEmail(form.email);
        break;
      case 'phone':
        error = validatePhone(form.phone);
        break;
      case 'nik':
        error = validateNik(form.nik);
        break;
      case 'job':
        error = validateJob(form.job);
        break;
      case 'placeOfBirth':
        error = validatePlaceOfBirth(form.placeOfBirth);
        break;
      case 'dateOfBirth':
        error = validateDateOfBirth(form.dateOfBirth);
        break;
      case 'gender':
        error = validateGender(form.gender);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));

    // submit only if there is no error and value has changed
    if (!error && form[field] !== prevForm[field]) {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        await handleSubmitField(field);
      } finally {
        setLoading((prev) => ({ ...prev, [field]: false })); // ensure loading is reset
      }
    } else {
      setLoading((prev) => ({ ...prev, [field]: false })); // reset loading if no submission
    }
  };

  const [jobOptions, setJobOptions] = useState([]);
  useEffect(() => {
    if (jobData) {
      const options = jobData?.data?.pagination?.collection?.map((opt) => ({
        name: opt.PEKERJAAN_DESKRIPSI,
        value: opt.PEKERJAAN_DESKRIPSI,
      }));
      setJobOptions(options);
    }
  }, [jobData]);

  useEffect(() => {
    if (profileData) {
      const { customer } = profileData.data;
      const updatedForm = {
        name: `${customer?.nama_depan} ${customer?.nama_belakang}`,
        email: customer?.email,
        phone: customer?.no_telp_pribadi,
        nik: customer?.no_ktp,
        job: customer?.pekerjaan,
        placeOfBirth: customer?.tempat_lahir,
        dateOfBirth: customer?.tgl_lahir,
        gender: customer?.jenis_kelamin,
      };
      setForm(updatedForm);
      setPrevForm(updatedForm);
    }
  }, [profileData]);

  return (
    <>
      <FormAccordion buttonText={'Biodata Diri*'}>
        <VStack padding={3} gap={7}>
          <UnderlinedInput
            inputIsDisabled
            inputType='text'
            inputLabel='No. Customer'
            inputValue={
              (profileData && profileData?.data?.customer?.customer_no) || '-'
            }
          />

          <HStack width='full'>
            <UnderlinedInput
              inputIsDisabled
              inputName='name'
              inputType='text'
              inputLabel='Nama Lengkap'
              inputPlaceHolder='Isi Nama lengkap Anda'
              inputOnBlur={() => {
                handleBlur('name');
              }}
              inputValue={form?.name || ''}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.name}
            />
            {loading.name && <Spinner />}
          </HStack>

          <HStack width='full'>
            <UnderlinedInput
              inputName='email'
              inputType='text'
              inputLabel='Email'
              inputPlaceHolder='Isi Nama email Anda'
              inputOnBlur={() => {
                handleBlur('email');
              }}
              inputValue={form?.email || ''}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.email}
            />
            {loading.email && <Spinner />}
          </HStack>

          <HStack width='full'>
            <UnderlinedInput
              inputName='phone'
              inputType='number'
              inputLabel='Nomor HP (WA Aktif)'
              inputPlaceHolder='Isi Nomor HP Anda'
              inputValue={form?.phone || ''}
              inputOnBlur={() => {
                handleBlur('phone');
              }}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.phone}
            />
            {loading.phone && <Spinner />}
          </HStack>

          <HStack width='full' position='relative'>
            <UnderlinedInput
              inputIsDisabled={profileData?.data?.customer?.no_ktp} // input will be disabled if has data
              inputName='nik'
              inputType='number'
              inputLabel='NIK'
              inputPlaceHolder='Isi NIK Anda'
              inputValue={form?.nik || ''}
              inputOnBlur={() => {
                handleBlur('nik');
              }}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.nik}
            />
            {loading.nik && <Spinner />}
            {!profileData?.data?.customer?.no_ktp && <InfoToolTip />}
          </HStack>

          <HStack width='full'>
            <UnderlinedSelect
              inputName='job'
              inputLabel='Pekerjaan'
              inputPlaceHolder='Pilih pekerjaan Anda'
              inputValue={form?.job || ''}
              inputOptions={jobOptions}
              inputOptionIsLoading={jobDataIsLoading}
              inputOptionIsError={jobDataIsError}
              inputOnBlur={() => {
                handleBlur('job');
              }}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.job}
            />
            {loading.job && <Spinner />}
          </HStack>

          <HStack width='full' pt={2}>
            <FormControl>
              <FormLabel
                color='#8B9E9E'
                fontSize={12}
                top={-3}
                zIndex={3}
                position={'absolute'}
                pointerEvents={'none'}
                my={-1}
                transformOrigin={'left top'}
              >
                Jenis Kelamin
              </FormLabel>
              <RadioGroup
                name='gender'
                onBlur={() => {
                  handleBlur('gender');
                }}
                onChange={(value) => {
                  handleChange(value);
                }}
                value={form?.gender || ''}
              >
                <Stack direction='row'>
                  <Radio value='LAKI-LAKI'>Pria</Radio>
                  <Radio value='PEREMPUAN'>Wanita</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {errors?.gender && <Text>errors?.gender </Text>}
            {loading.gender && <Spinner />}
          </HStack>

          <HStack width='full'>
            <UnderlinedInput
              inputName='placeOfBirth'
              inputType='text'
              inputLabel='Tempat Lahir'
              inputPlaceHolder='Kota'
              inputOnBlur={() => {
                handleBlur('placeOfBirth');
              }}
              inputValue={form?.placeOfBirth || ''}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.placeOfBirth}
            />
            {loading.placeOfBirth && <Spinner />}
          </HStack>

          <HStack width='full' position='relative'>
            <UnderlinedInput
              inputIsDisabled={profileData?.data?.customer?.tgl_lahir} // input will be disabled if has data
              inputName='dateOfBirth'
              inputType='date'
              inputLabel='Tanggal Lahir'
              inputPlaceHolder='Pilih tanggal lahir Anda'
              inputOnBlur={() => {
                handleBlur('dateOfBirth');
              }}
              inputValue={form?.dateOfBirth || ''}
              inputOnChange={(e) => {
                handleChange(e);
              }}
              inputError={errors?.dateOfBirth}
            />
            {loading.dateOfBirth && <Spinner />}
            {!profileData?.data?.customer?.tgl_lahir && <InfoToolTip />}
          </HStack>

          {/* validation error from BE */}
          {validationErrorMsg && (
            <Text fontSize={11} color={'red.100'} m={1}>
              {validationErrorMsg}
            </Text>
          )}
        </VStack>
      </FormAccordion>
    </>
  );
};

export default BiodataForm;
