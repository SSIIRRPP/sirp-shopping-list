import React, { forwardRef } from 'react';
import { ReactComponent as ExpandSVG } from '../assets/icons/expand.svg';
import { useAppSelector } from '../app/hooks';
import { selectTheme } from '../features/theme/themeSlice';
import useClearProps from '../hooks/useClearProps';
import './styles/ExpandIcon.scss';

interface ExpandIconCompProps {
  open: boolean;
  className?: string;
}

const ExpandIconComp = (
  props: ExpandIconCompProps,
  ref: React.ForwardedRef<any>
) => {
  const newProps = useClearProps(props, ['open', 'className']);
  const theme = useAppSelector(selectTheme);

  return (
    <ExpandSVG
      className={`ExpandIcon${props.open ? ' open' : ''}${
        props.className ? ` ${props.className}` : ''
      }`}
      ref={ref}
      fill={theme.color}
      {...newProps}
    />
  );
};

ExpandIconComp.displayName = 'ExpandIcon';

const ExpandIcon = forwardRef(ExpandIconComp);

export default ExpandIcon;
