import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { ScalprumComponent } from '@scalprum/react-core';
import { useHistory } from 'react-router-dom';
import { useStore } from 'react-redux';
import { Bullseye, Spinner } from '@patternfly/react-core';
import InventoryLoadError from './InventoryLoadError';
import classNames from 'classnames';

const BaseInventoryDetailHead = (props) => {
  const history = useHistory();
  const store = useStore();
  const Cmp = props.component;
  return (
    <Cmp className={classNames(props.className, 'inventory')}>
      <Suspense fallback={props.fallback}>
        <ScalprumComponent
          history={history}
          store={store}
          appName="inventory"
          module="./InventoryDetailHead"
          scope="inventory"
          ErrorComponent={<InventoryLoadError component="InventoryDetailHead" history={history} store={store} {...props} />}
          ref={props.innerRef}
          {...props}
        />
      </Suspense>
    </Cmp>
  );
};

BaseInventoryDetailHead.propTypes = {
  fallback: PropTypes.node,
  innerRef: PropTypes.object,
  component: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Inventory sub component.
 *
 * This component shows system information (tags, facts and basic operations).
 */
const InventoryDetailHead = React.forwardRef((props, ref) => <BaseInventoryDetailHead innerProps={ref} {...props} />);

InventoryDetailHead.propTypes = {
  /** React Suspense fallback component. <a href="https://reactjs.org/docs/code-splitting.html#reactlazy" target="_blank">Learn more</a>. */
  fallback: PropTypes.node,
  /** Optional wrapper component */
  component: PropTypes.string,
  /** Optional classname applied to wrapper component */
  className: PropTypes.string,
};

InventoryDetailHead.defaultProps = {
  fallback: (
    <Bullseye className="pf-u-p-lg">
      <Spinner size="xl" />
    </Bullseye>
  ),
  component: 'section',
};

export default InventoryDetailHead;
