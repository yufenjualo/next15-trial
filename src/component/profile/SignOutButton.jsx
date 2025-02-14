import { Button, Text } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import Swal from 'sweetalert2';

const SignOutButton = () => {
  const handleSignout = async () => {
    const confirmSignOut = await Swal.fire({
      text: 'Apakah Anda yakin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Kembali',
    });

    if (confirmSignOut.isConfirmed) {
      localStorage.removeItem('hasShownAuctionTour');
      signOut();
    }
  };

  return (
    <>
      <Button
        my={2}
        width={{ base: 'full', md: '250px' }}
        type='submit'
        rounded={'3xl'}
        color={'white'}
        background={'#EC3235'}
        _hover={{
          background: '#EC3235',
        }}
        onClick={() => {
          handleSignout();
        }}
      >
        <Text my={5} fontSize={12}>
          Keluar Akun
        </Text>
      </Button>
    </>
  );
};

export default SignOutButton;
