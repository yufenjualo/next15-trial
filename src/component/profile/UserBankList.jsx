'use client';
import {
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useProfile } from '@/contexts/ProfileContext';
import { FaCog } from 'react-icons/fa';

const UserBankList = ({ setEditBankItem, handleDelete }) => {
  const { savedBankData } = useProfile();

  if (!savedBankData?.data?.pagination?.collection?.length) {
    return null;
  }

  return (
    <VStack>
      <Divider />
      <Flex>Daftar Bank Tersimpan</Flex>
      <Divider />
      <TableContainer width='full' overflow='scroll'>
        <Table variant='simple'>
          <Tbody>
            {savedBankData?.data?.pagination?.collection?.map((item) => (
              <Tr fontSize={12} key={item?.CUSTOMER_BANK_ID}>
                <Td>{item?.MST_BANK_DESKRIPSI || '-'}</Td>
                <Td isNumeric>{item?.CUSTOMER_BANK_ACCOUNT_NUMBER || '-'}</Td>
                <Td>{item?.CUSTOMER_BANK_ACCOUNT_NAME || '-'}</Td>
                <Td>
                  <>
                    <Menu>
                      <MenuButton>
                        <FaCog />
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            setEditBankItem(item);
                            window.scrollTo(0, 0);
                          }}
                        >
                          Edit Bank
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleDelete(item?.CUSTOMER_BANK_ID);
                          }}
                        >
                          Hapus Bank
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default UserBankList;
