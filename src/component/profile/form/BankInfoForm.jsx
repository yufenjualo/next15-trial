'use client';
import { Button, Flex, FormControl, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FormAccordion from './FormAccordion';
import UnderlinedInput from '@/components/common/form/underlined-input/UnderlinedInput';
import api from '@/services/api';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import UnderlinedSelect from '@/components/common/form/underlined-input/UnderlinedSelect';
import { useProfile } from '@/contexts/ProfileContext';
import UserBankList from '../UserBankList';
import Swal from 'sweetalert2';
import handleAxiosError from '@/utils/handleAxiosError';

const BankInfoForm = () => {
  const [editBankItem, setEditBankItem] = useState(null);
  const { data: session } = useSession();
  const { refetchsavedBankData } = useProfile();

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  const formData = watch();

  useEffect(() => {
    register('bank', { required: 'Bank harus dipilih!' });
    register('bankAccountNumber', { required: 'Nomor Rekening harus disi!' });
    register('bankAccountName', {
      required: 'Nama Pemilik Rekening harus disi!',
    });
  }, [register]); // only run once when component mounts

  const fetchAllBanks = async () => {
    let allBanks = [];
    let page = 1;
    let moreData = true;
    let perPage = 50;

    while (moreData) {
      const response = await api.bank.fetchMstBank({ page, per_page: perPage });
      const data = response.data;
      const totalPages = Math.ceil((data?.pagination?.total || 0) / perPage);

      if (totalPages >= page) {
        allBanks = [...allBanks, ...data.pagination.collection];
        page += 1;
      } else {
        moreData = false; // stop when there's no more data
      }
    }
    return allBanks;
  };

  const {
    data: fetchMSTBankData,
    isLoading: fetchMSTBankLoading,
    isError: fetchMSTBankIsError,
  } = useQuery({
    queryKey: ['mstBankData'],
    queryFn: fetchAllBanks,
  });

  const [bankListOptions, setBankListOptions] = useState([]); // bank options
  useEffect(() => {
    if (fetchMSTBankData) {
      const options = fetchMSTBankData.map((opt) => ({
        name: opt.TITLE,
        value: opt.MST_BANK_ID,
      }));
      setBankListOptions(options);
    }
  }, [fetchMSTBankData]);

  // useMutation to handle delete bank account
  const deleteBankMutation = useMutation({
    mutationFn: (custBankId) =>
      api.profile.deleteUserBank(custBankId, session?.user?.data?.token),
    onSuccess: (data) => {
      if (data.status === 'success') {
        refetchsavedBankData();
        Swal.fire({
          text: 'Rekening telah dihapus',
          icon: 'success',
        });
      }
    },
    onError: (error) => {
      const errorMsg = handleAxiosError(error);
      Swal.fire({
        text: 'Terjadi error',
        icon: 'error',
      });
    },
  });

  // useMutation to handle create/update bank account
  const useBankMutation = (mutationFn, successMessage) =>
    useMutation({
      mutationFn: (formData) =>
        mutationFn(formData, session?.user?.data?.token),
      onSuccess: (data) => {
        if (data.status === 'success') {
          refetchsavedBankData();
          Swal.fire({
            text: successMessage,
            icon: 'success',
          });
          setEditBankItem(null);
          reset();
        }
      },
      onError: (error) => {
        handleAxiosError(error);
        Swal.fire({
          text: 'Terjadi error',
          icon: 'error',
        });
      },
    });

  const submitBankMutation = useBankMutation(
    api.profile.submitUserNewBank,
    'Rekening berhasil disimpan'
  );

  const submitEditBankMutation = useBankMutation(
    api.profile.submitEditUserBank,
    'Perubahan Rekening berhasil disimpan'
  );

  const handleSubmitForm = async (data) => {
    if (data) {
      const formData = new FormData();
      formData.append('MST_BANK_ID', data?.bank);
      formData.append('CUSTOMER_BANK_ACCOUNT_NUMBER', data?.bankAccountNumber);
      formData.append(
        'CUSTOMER_BANK_ACCOUNT_NAME',
        data?.bankAccountName?.toUpperCase()
      );

      if (editBankItem) {
        formData.append('_method', 'PUT');
        formData.append('cust_bank_id', editBankItem?.CUSTOMER_BANK_ID);
        // call api to submit update bank data
        await submitEditBankMutation.mutateAsync(
          formData,
          session.user.data.token
        );
      } else {
        // call api to submit new bank data
        await submitBankMutation.mutateAsync(formData, session.user.data.token);
      }
    }
  };

  const handleDelete = async (custBankId) => {
    const confirmSignOut = await Swal.fire({
      text: 'Apakah Anda yakin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
    });

    if (confirmSignOut.isConfirmed) {
      await deleteBankMutation.mutateAsync(custBankId, session.user.data.token);
    }
  };

  const handleCancel = () => {
    setEditBankItem(null);
    reset();
  };

  useEffect(() => {
    if (editBankItem) {
      setValue('bank', editBankItem?.MST_BANK_ID);
      setValue('bankAccountNumber', editBankItem?.CUSTOMER_BANK_ACCOUNT_NUMBER);
      setValue('bankAccountName', editBankItem?.CUSTOMER_BANK_ACCOUNT_NAME);
    }
  }, [editBankItem, bankListOptions, setValue]);

  return (
    <>
      <FormAccordion
        buttonText={'Data Bank*'}
        // defaultIndex={0}
      >
        <form
          onSubmit={handleSubmit(async (data) => {
            await handleSubmitForm(data);
          })}
        >
          <VStack padding={3} gap={7} mb={3}>
            <Flex width='full'>
              <Text>
                Auksi membutuhkan nomor rekening Anda untuk pengembalian
                deposit. Pastikan nomor rekening sudah benar.
              </Text>
            </Flex>

            <UnderlinedSelect
              inputLabel='Nama Bank'
              inputPlaceHolder='Pilih Rekening Bank Anda'
              inputError={errors?.bank?.message}
              inputValue={formData.bank || ''}
              inputOptions={bankListOptions}
              inputOptionIsLoading={fetchMSTBankLoading}
              inputOptionIsError={fetchMSTBankIsError}
              inputOnChange={(val) => {
                setValue('bank', val.target.value);
              }}
            />

            <UnderlinedInput
              inputType='number'
              inputLabel='No. Rekening'
              inputPlaceHolder='Masukkan Nomor Rekening'
              inputError={errors?.bankAccountNumber?.message}
              inputValue={formData.bankAccountNumber || ''}
              inputOnChange={(val) => {
                setValue('bankAccountNumber', val.target.value);
              }}
            />

            <UnderlinedInput
              inputType='text'
              inputLabel='Nama Pemilik Rekening'
              inputPlaceHolder='Masukkan Nama Pemilik Rekening'
              inputError={errors?.bankAccountName?.message}
              inputValue={formData.bankAccountName || ''}
              inputOnChange={(val) => {
                setValue('bankAccountName', val.target.value);
              }}
            />

            <FormControl>
              <Flex justifyContent={'center'} gap={5}>
                <Button
                  isLoading={
                    editBankItem
                      ? submitEditBankMutation.isPending
                      : submitBankMutation.isPending
                  }
                  width={'full'}
                  type='submit'
                  rounded={'3xl'}
                  color='white'
                  background={'#00AFF0'}
                  _hover={{
                    background: '#00AFF0',
                  }}
                >
                  <Text my={5} fontSize={12}>
                    {editBankItem ? 'Ubah Rekening' : 'Tambah Rekening'}
                  </Text>
                </Button>

                {/* batal button only show when edit is present */}
                {editBankItem && (
                  <Button
                    type='reset'
                    background='#EC3235'
                    rounded={'3xl'}
                    width={'full'}
                    color='white'
                    _hover={{
                      background: '#EC3235',
                    }}
                    onClick={() => {
                      handleCancel();
                    }}
                  >
                    <Text my={5} fontSize={12}>
                      Batal
                    </Text>
                  </Button>
                )}
              </Flex>
            </FormControl>
          </VStack>
        </form>
        <UserBankList
          setEditBankItem={setEditBankItem}
          handleDelete={handleDelete}
        />
      </FormAccordion>
    </>
  );
};

export default BankInfoForm;
