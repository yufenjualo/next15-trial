import { Box, Tooltip, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';

const InfoToolTip = () => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const handleTooltipToggle = () => {
    setIsTooltipOpen(!isTooltipOpen);
  };

  return (
    <VStack>
      <Box position='absolute' left={0} bottom={'14px'}>
        <Tooltip
          background='blue.400'
          color='white'
          hasArrow
          aria-label='A tooltip'
          rounded='2xl'
          py={2}
          px={3}
          label='Hanya dapat diisi sekali, hubungi Admin AUKSI bila ingin mengubah data.'
          isOpen={isTooltipOpen}
        >
          <Box cursor='pointer'>
            <span>
              <IoIosInformationCircleOutline onClick={handleTooltipToggle} />
            </span>
          </Box>
        </Tooltip>
      </Box>
    </VStack>
  );
};

export default InfoToolTip;
