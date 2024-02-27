export type FavoritePage = {
  pathname: string;
  favorite: boolean;
};

export type LastVisitedPage = {
  pathname: string;
  title: string;
  bundle: string;
};

export type VisitedBundles = { [bundle: string]: true };

export type UserIdentity = {
  lastVisitedPages: LastVisitedPage[];
  favoritePages: FavoritePage[];
  visitedBundles: VisitedBundles;
  initialized: boolean;
};

export enum UpdateEvents {
  lastVisited = 'lastVisited',
  favoritePages = 'favoritePages',
  visitedBundles = 'visitedBundles',
}

const chromeState = () => {
  let state: UserIdentity = {
    lastVisitedPages: [],
    favoritePages: [],
    visitedBundles: {},
    initialized: false,
  };

  // registry of all subscribers (hooks)
  const subscriptions: {
    [key in UpdateEvents]: Map<symbol, { onUpdate: () => void }>;
  } = {
    lastVisited: new Map(),
    favoritePages: new Map(),
    visitedBundles: new Map(),
  };

  // add subscriber (hook) to registry
  function subscribe(event: UpdateEvents, onUpdate: () => void) {
    // use symbol as unique ID
    // Symbol('foo') !== Symbol('foo'), no need for UUID or any other id generator
    const id = Symbol(event);
    // add new subscriber
    subscriptions[event].set(id, { onUpdate });
    // trigger initial update to get the initial data
    onUpdate();
    return id;
  }

  // remove subscriber from registry
  function unsubscribe(id: symbol, event: UpdateEvents) {
    if (subscriptions[event].has(id)) {
      subscriptions[event].delete(id);
    } else {
      console.error('Trying to unsubscribe non existing client!');
    }
  }

  // update state attribute and push data to subscribers
  function update(event: UpdateEvents, attributes: Partial<UserIdentity>) {
    state = {
      ...state,
      ...attributes,
    };
    const updateSubscriptions = subscriptions[event];
    if (updateSubscriptions.size === 0) {
      return;
    }

    // update the subscribed clients
    Array.from(updateSubscriptions.values()).forEach((subscriber) => {
      subscriber.onUpdate();
    });
  }

  // last visited update event wrapper
  function setLastVisited(pages: LastVisitedPage[]) {
    update(UpdateEvents.lastVisited, { lastVisitedPages: pages });
  }

  function setFavoritePages(pages: FavoritePage[]) {
    update(UpdateEvents.favoritePages, { favoritePages: pages });
  }

  function setVisitedBundles(visitedBundles: VisitedBundles) {
    update(UpdateEvents.visitedBundles, { visitedBundles });
  }

  function getState() {
    return state;
  }

  // initializes state with new identity and should trigger all updates
  function setIdentity({ lastVisitedPages, ...userIdentity }: UserIdentity) {
    state = { ...state, ...userIdentity, initialized: true };
    Object.values(subscriptions)
      .flat()
      .forEach((event) => {
        Array.from(event.values()).forEach((sub) => {
          sub.onUpdate();
        });
      });
  }

  // public state manager interface
  return {
    getState,
    setLastVisited,
    setIdentity,
    setFavoritePages,
    setVisitedBundles,
    subscribe,
    unsubscribe,
    update,
  };
};

export default chromeState;
