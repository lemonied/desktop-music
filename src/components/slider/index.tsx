import React, {
  Children,
  CSSProperties,
  forwardRef,
  ForwardRefRenderFunction,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import BScroll from '@better-scroll/core';
import Slide from '@better-scroll/slide';
import { combineClassNames, debounce } from '../../helpers/utils';
import './style.scss';

BScroll.use(Slide);

interface SliderInstance {
  next(time?: number, easing?: object): void;
  prev(time?: number, easing?: object): void;
  destroy(): void;
  refresh(): void;
  play(): void;
  stop(): void;
}
interface SliderProps {
  children: ReactElement[];
  dot?: boolean;
  loop?: boolean;
  click?: boolean;
  interval?: number;
  autoplay?: boolean;
  threshold?: number;
  speed?: number;
  data?: any;
  slider?: { [prop: string]: any };
  direction?: 'x' | 'y';
  className?: string;
  style?: CSSProperties;
}
// Slider Hook
export const useSlider = ():SliderInstance  => {
  const instance = useRef<SliderInstance>({} as SliderInstance);
  return instance.current;
};
const Slider: ForwardRefRenderFunction<SliderInstance, SliderProps> = function(props, ref) {
  const {
    children = [],
    dot = true,
    loop = true,
    click = true,
    interval = 4000,
    autoplay = true,
    threshold = 0.3,
    speed = 400,
    data,
    slider,
    direction = 'x',
    className,
    style
  } = props;

  const [ currentIndex, setCurrentIndex ] = useState<number>(0);
  const scrollRef = useRef<BScroll>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slideGroupRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>();
  const childrenLength = useMemo(() => {
    return Children.toArray(children).length;
  }, [children]);

  const initSlideWidth = useCallback(() => {
    if (direction === 'y') { return; }
    const wrapper = wrapperRef.current;
    const slideGroup: any = slideGroupRef.current;
    const items: any = slideGroupRef.current?.children;
    if (wrapper && items && slideGroup) {
      slideGroup.style.width =  wrapper.clientWidth * childrenLength + (loop ? 2 * wrapper.clientWidth : 0) + 'px';
      Array.prototype.slice.call(items).forEach((item: HTMLElement) => {
        item.style.width = wrapper.clientWidth + 'px';
      });
    }
  }, [loop, childrenLength, direction]);
  // Instance
  const instance = useMemo<SliderInstance>(() => {
    return {
      prev: (...args) => {
        scrollRef.current?.prev(...args);
      },
      next: (...args) => {
        scrollRef.current?.next(...args);
      },
      destroy: () => {
        clearTimeout(timerRef.current);
        scrollRef.current?.destroy();
      },
      refresh: () => {
        scrollRef.current?.refresh();
      },
      play: () => {
        clearTimeout(timerRef.current);
        if (autoplay) {
          timerRef.current = setTimeout(() => {
            instance.next();
          }, interval);
        }
      },
      stop: () => {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoplay, interval]);
  // Create Scroller
  useEffect(() => {
    initSlideWidth();
    const scroll = scrollRef.current = new BScroll(wrapperRef.current as HTMLElement, {
      probeType: 3,
      scrollX: direction === 'x',
      scrollY: direction === 'y',
      momentum: false,
      slide: {
        loop: loop,
        threshold: threshold,
        speed: speed
      },
      useTransition: true,
      bounce: false,
      stopPropagation: true,
      click: click,
      eventPassthrough: direction === 'x' ? 'vertical' : 'horizontal'
    });
    setCurrentIndex(0);
    instance.play();
    scroll.on('scrollEnd', () => {
      if (direction === 'x') {
        setCurrentIndex(scroll.getCurrentPage().pageX);
      } else {
        setCurrentIndex(scroll.getCurrentPage().pageY);
      }
      instance.play();
    });
    scroll.on('touchEnd', () => {
      instance.play();
    });
    scroll.on('beforeScrollStart', () => {
      instance.stop();
    });
    const onResize = debounce(() => {
      initSlideWidth();
      instance.refresh();
    }, 300);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      instance.destroy();
    };
  }, [initSlideWidth, loop, threshold, speed, click, instance, data, direction]);
  // use instance
  useEffect(() => {
    if (slider && typeof slider === 'object') {
      Object.assign(slider, instance);
    }
  }, [instance, slider]);
  useImperativeHandle(ref, () => {
    return instance;
  });

  return (
    <div ref={wrapperRef} className={combineClassNames('windy-slider', className)} style={style}>
      <div className={direction === 'x' ? 'slider-group' : 'slider-group-vertical'} ref={slideGroupRef}>
        {
          Children.map(children, ((item, key) => (
            <div
              className={'slide-item'}
              key={key}
            >{ item }</div>
          )))
        }
      </div>
      {
        dot ?
          <div className={combineClassNames('dot-group', direction === 'y' ? 'dot-group-right' : null)}>
            { Children.map(children, (item, key) => (<span key={key} className={currentIndex === key ? 'active' : ''} />)) }
          </div> :
          null
      }
    </div>
  );
};

export const Sliders = forwardRef<SliderInstance, SliderProps>(Slider);
