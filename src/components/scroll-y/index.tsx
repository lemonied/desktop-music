import React, {
  CSSProperties,
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import BScroll from '@better-scroll/core';
import { ExposedAPI } from '@better-scroll/core/dist/types/scroller/Scroller';
/*
* examples for ease
* import { ease } from '@better-scroll/shared-utils';
*/
import PullUp from '@better-scroll/pull-up';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';
import { Loading } from '../loading';
import { combineClassNames } from '../../helpers/utils';
import './style.scss';

BScroll
  .use(PullUp)
  .use(ScrollBar)
  .use(MouseWheel);

export interface ScrollYInstance {
  finishPullUp: () => void;
  refresh: () => void;
  closePullUp: () => void;
  openPullUp: (option?: any) => void;
  scrollTo: ExposedAPI['scrollTo'];
  scrollToElement: ExposedAPI['scrollToElement'];
}
// ScrollY Hook
export const useScrollY = (): ScrollYInstance => {
  const scroll = useRef<ScrollYInstance>({} as ScrollYInstance);
  return scroll.current;
};
/*
* @Params probeType
* When set to 1, The scroll event is non-real time fired (after the screen scrolled for some time)
* When set to 2, the scroll event is real-time fired during the screen scrolling
* When set to 3, the scroll event is real-time fired during not only the screen scrolling but also the momentum and bounce animation
* If not set, the default value 0 means there is no scroll event is fired.
*/
export interface ScrollYProps {
  probeType?: 1 | 2 | 3;
  onScroll?: (position: Position) => void;
  onPullingUp?: () => void;
  style?: CSSProperties;
  scroll?: { [prop: string]: any };
  children?: ReactNode;
  data?: any;
  scrollbar?: { fade: boolean; interactive: boolean; };
  className?: string;
  bounce?: boolean;
}
// check if event type exists
function checkEventAndBind(scroll: BScroll, eventType: string, handler: (e: any) => void) {
  if (typeof scroll.eventTypes[eventType] !== 'undefined') {
    scroll.on(eventType, handler);
  }
}
function checkEventAndUnBind(scroll: BScroll, eventType: string, handler: (e: any) => void) {
  if (typeof scroll.eventTypes[eventType] !== 'undefined') {
    scroll.off(eventType, handler);
  }
}
// ScrollY Component
const ScrollYFc: ForwardRefRenderFunction<ScrollYInstance, ScrollYProps> = function (props, ref) {

  const { style, children, data, className, bounce = false } = props;
  const { onScroll, onPullingUp, scroll, scrollbar } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<BScroll>();
  const [ pullingUp, setPullingUp ] = useState<boolean>(false);
  const propsRef = useRef<ScrollYProps>(Object.assign({}, props));
  const pullUpLoadConf = useMemo(() => {
    return { threshold: 0 };
  }, []);
  const scrollBarConf = useMemo(() => {
    if (typeof scrollbar === 'undefined') {
      return {
        fade: true,
        interactive: false
      };
    }
    return scrollbar;
  }, [scrollbar]);

  // Create Scroller
  useEffect(() => {
    const { probeType = 1, onPullingUp } = propsRef.current;
    instanceRef.current = new BScroll(wrapperRef.current as HTMLElement, {
      scrollY: true,
      click: true,
      probeType,
      pullUpLoad: onPullingUp ? pullUpLoadConf : undefined,
      scrollbar: scrollBarConf,
      mouseWheel: {
        speed: 20,
        invert: false,
        easeTime: 300
      },
      bounce
    });
    return function () {
      instanceRef.current?.destroy();
    };
  }, [pullUpLoadConf, scrollBarConf, bounce]);
  // onScroll
  useEffect(() => {
    const wrapper = instanceRef.current;
    const listener = (e: any) => {
      if (typeof onScroll === 'function') {
        onScroll(e);
      }
    };
    wrapper?.on('scroll', listener);
    return () => {
      instanceRef.current?.off('scroll', listener);
    };
  }, [onScroll]);
  // on pulling up
  useEffect(() => {
    const wrapper = instanceRef.current;
    const pullingUp = () => {
      if (typeof onPullingUp === 'function') {
        setPullingUp(true);
        onPullingUp();
      }
    };
    if (wrapper) {
      checkEventAndBind(wrapper, 'pullingUp', pullingUp);
    }
    return () => {
      if (instanceRef.current) {
        checkEventAndUnBind(instanceRef.current, 'pullingUp', pullingUp);
      }
    };
  }, [onPullingUp]);
  // instance
  const instance = useMemo<ScrollYInstance>(() => {
    const refresh = () => {
      instanceRef.current?.refresh();
    };
    const finishPullUp = () => {
      setPullingUp(false);
      instanceRef.current?.finishPullUp();
    };
    const closePullUp = () => {
      finishPullUp();
      instanceRef.current?.closePullUp();
    };
    const openPullUp = (option = pullUpLoadConf) => {
      instanceRef.current?.openPullUp(option);
    };
    return {
      finishPullUp,
      refresh,
      closePullUp,
      openPullUp,
      scrollTo: (...args) => {
        instanceRef.current?.scrollTo(...args);
      },
      scrollToElement: (...args) => {
        instanceRef.current?.scrollToElement(...args);
      }
    };
  }, [pullUpLoadConf]);
  // use instance
  useEffect(() => {
    if (scroll && typeof scroll === 'object') {
      Object.assign(scroll, instance);
    }
  }, [scroll, instance]);
  // watch data change
  useEffect(() => {
    instance.refresh();
  }, [instance, data, pullingUp]);

  useImperativeHandle(ref, () => {
    return instance;
  });

  return (
    <div className={ combineClassNames('windy-scroll-y-wrapper', className) } style={style}>
      <div className={ 'scroll-y' } ref={ wrapperRef }>
        <div>
          { children }
          {
            pullingUp ?
              <Loading title={'正在加载...'} size={'small'} /> :
              null
          }
        </div>
      </div>
    </div>
  );
};

export const ScrollY = forwardRef<ScrollYInstance, ScrollYProps>(ScrollYFc);