import React, {
  CSSProperties,
  forwardRef,
  ForwardRefRenderFunction,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import BScroll from '@better-scroll/core';
import { ScrollYInstance } from '../scroll-y';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';

export interface ScrollXInstance {
  refresh: ScrollYInstance['refresh'];
  scrollTo: ScrollYInstance['scrollTo'];
  scrollToElement: ScrollYInstance['scrollToElement'];
}
interface ScrollXProps {
  children?: ReactElement;
  scroll?: ScrollXInstance;
  className?: string;
  style?: CSSProperties;
  dot?: boolean;
}
export const useScrollX = (): ScrollXInstance => {
  const instance = useRef<ScrollXInstance>({} as ScrollXInstance);
  return instance.current;
};
const ScrollXFc: ForwardRefRenderFunction<ScrollXInstance, ScrollXProps> = (props, ref) => {
  const { children, className, scroll, style, dot } = props;

  const [ showDot, setShowDot ] = useState<boolean>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<BScroll>();
  const dotRef = useRef<HTMLDivElement>(null);
  const childRef = useRef({
    widthPercent: 0
  });

  useEffect(() => {
    const scroll = scrollRef.current = new BScroll(wrapperRef.current as HTMLElement, {
      probeType: 3,
      scrollX: true,
      scrollY: false,
      eventPassthrough: 'vertical'
    });
    scroll.on('scroll', (pos: any) => {
      const dot = dotRef.current;
      const wrapper = wrapperRef.current;
      if (dot && wrapper) {
        const x = pos.x * 100;
        dot.style.left = x / scroll.maxScrollX * childRef.current.widthPercent + '%';
      }
    });
    return () => {
      scrollRef.current?.destroy();
    };
  }, []);
  const instance = useMemo<ScrollXInstance>(() => {
    return {
      refresh() {
        scrollRef.current?.refresh();
      },
      scrollTo(...args) {
        scrollRef.current?.scrollTo(...args);
      },
      scrollToElement(...args) {
        scrollRef.current?.scrollToElement(...args);
      }
    };
  }, []);
  useEffect(() => {
    if (scroll) {
      Object.assign(scroll, instance);
    }
  }, [scroll, instance]);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const dot = dotRef.current;
    if (dot && wrapper && wrapper.children && wrapper.children[0]) {
      const percent = childRef.current.widthPercent = wrapper.clientWidth / wrapper.children[0].clientWidth;
      dot.style.width = percent * 100 + '%';
      setShowDot(percent < 1);
    }
  }, [children]);

  useImperativeHandle(ref, () => {
    return instance;
  });

  return (
    <div
      className={combineClassNames('windy-scroll-x', className, dot ? 'has-dot' : '')}
      ref={wrapperRef}
      style={style}
    >
      { children }
      {
        dot && showDot ?
          <div className={'scroll-x-dot-group'}>
            <div className={'scroll-x-dot'} ref={dotRef} />
          </div> :
          null
      }
    </div>
  );
};

export const ScrollX = forwardRef<ScrollXInstance, ScrollXProps>(ScrollXFc);
