'use client';
import BackButton from '@/layout/BackButton';
import { Box, Flex, Skeleton, Stack, Text, VStack } from '@chakra-ui/react';
import AlertDialogError from '../common/alert-dialog/AlertDialogError';
import useAuthCheck from '@/customHooks/useAuthCheck';
import { useSession } from 'next-auth/react';
import BiodataForm from './form/BiodataForm';
import SignOutButton from './SignOutButton';
import BankInfoForm from './form/BankInfoForm';
import AddressInfoForm from './form/AddressInfoForm';

const ProfileContainer = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { errorMessage, setErrorMessage, isForceSignOut } = useAuthCheck();
  return (
    <>
      <Box py={2}>
        <BackButton />
      </Box>

      <VStack gap={3} width='full' mb={5}>
        <Box fontWeight='bold' fontSize={15} width='full'>
          <Flex gap={1} width='full' justify='center'>
            <Text>Hai</Text>

            {sessionStatus !== 'loading' ? (
              <>
                <Text textTransform='capitalize'>
                  {session?.user?.data?.customer?.nama_depan?.toLowerCase() ||
                    ''}
                  ,
                </Text>
              </>
            ) : (
              <Skeleton display='inline-block' width='12%' height='25px' />
            )}

            <Text>Lengkapi Profil Anda</Text>
          </Flex>
        </Box>
      </VStack>

      <VStack width='full' gap={5} mb={5} minH={{ md: '400px' }}>
        <BiodataForm />
        <AddressInfoForm />
        <BankInfoForm />
        <SignOutButton />
      </VStack>

      <AlertDialogError
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isForceSignOut={isForceSignOut}
      />
    </>
  );
};

export default ProfileContainer;
