import { React } from 'react';
import { css } from '@emotion/css';
import PropTypes from 'prop-types';
import { theme } from 'src/style';

const style = {
  wrapper: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    marginBottom: '10px',
  },
  hl: {
    marginBottom: '5px',
    fontWeight: theme.fontWeights.medium,
  },
  text: {
    textAlign: 'justify',
  },
};
export default function MapPost({ headline, text, imageSrc }) {
  return (
    <div className={css(style.wrapper)}>
      <img alt={text} className={css(style.image)} src={imageSrc} />
      <h4 className={css(style.hl)}>{headline}</h4>
      <div className={css(style.text)}>{text}</div>
    </div>
  );
}

MapPost.propTypes = {
  headline: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
};
