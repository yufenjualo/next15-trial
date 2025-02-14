import ProfileContainer from '@/components/profile/ProfileContainer';
import { Container } from '@chakra-ui/react';
import { ProfileProvider } from '@/contexts/ProfileContext';

const ProfilePage = async () => {
  return (
    <Container>
      <ProfileProvider>
        <ProfileContainer />
      </ProfileProvider>
    </Container>
  );
};

export default ProfilePage;
