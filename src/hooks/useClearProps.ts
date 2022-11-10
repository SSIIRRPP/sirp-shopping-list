import { useMemo } from 'react';

interface useClearPropsProps {
  props: { [k: string]: any };
  clearProps: string[];
}

const useClearProps = (
  props: useClearPropsProps['props'] = {},
  clearProps: useClearPropsProps['clearProps'] = []
) => {
  const newProps = useMemo(() => {
    const p = { ...props };
    clearProps.forEach((propName) => {
      delete p[propName];
    });
    return p;
  }, [props, clearProps]);
  return newProps;
};

export default useClearProps;
