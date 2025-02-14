import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Icon,
  Text,
} from '@chakra-ui/react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

const FormAccordion = ({
  buttonText = '',
  children = undefined,
  defaultIndex = undefined,
}) => {
  return (
    <Accordion width='full' allowToggle defaultIndex={defaultIndex}>
      <AccordionItem border='none'>
        {({ isExpanded }) => (
          <>
            <h2>
              <AccordionButton
                width='full'
                _expanded={{ bg: '#ECECEC' }}
                borderRadius='md'
                padding='12px'
                boxShadow='sm'
                backgroundColor='#ECECEC'
                border='1px solid'
                borderColor='#B1B1B1'
                shadow='sm'
              >
                <Box flex='1' textAlign='left' width='full'>
                  <Text fontSize={12} fontWeight='bold'>
                    {buttonText}
                  </Text>
                </Box>
                <Icon
                  as={MdOutlineKeyboardArrowDown}
                  transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                  transition='transform 0.2s'
                  boxSize={5}
                />
              </AccordionButton>
            </h2>
            <AccordionPanel
              rounded='md'
              padding='12px'
              mt={3}
              bg='white'
              boxShadow='sm'
            >
              {children}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default FormAccordion;
