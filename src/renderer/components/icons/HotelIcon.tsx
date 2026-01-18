import React from 'react';

// Inn/Hotel icon - bed/house for spawn points
const HotelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" {...props}>
    <path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64v336c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V96h384v304c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V64c0-17.7-14.3-32-32-32H32zM96 192c0-17.7 14.3-32 32-32h256c17.7 0 32 14.3 32 32v96H96V192zm32 32v32h256V224H128zM80 320h352v80c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V320z"/>
  </svg>
);

export default HotelIcon;
