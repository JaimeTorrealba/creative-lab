export const STATES = Object.freeze({
  idle: 'idle',
  walking: 'walking',
  running: 'running',
  jumping: 'jumping',
  creeping: 'creeping'
})

const defaultMovementKeys = Object.freeze({
  forward: 'w',
  backward: 's',
  leftward: 'a',
  rightward: 'd'
})

export const getMovementKey = (keys) => {
  const movementKeys = ['forward', 'backward', 'leftward', 'rightward']
  const result: (boolean | { name: string; key: string })[] = [] // Change the type of 'result' array
  movementKeys.map((key) => {
    const [filteredKey] = keys.value.filter((k) => k.name === key)
    if (filteredKey) result.push(filteredKey)
    else result.push({ name: key, key: defaultMovementKeys[key] })
  })
  const extraKeys = ['run', 'creep', 'jump']
  extraKeys.map((key) => {
    const [filteredKey] = keys.value.filter((k) => k.name === key)
    if (filteredKey) result.push(filteredKey)
    else result.push(false)
  })
  return result
}

export const getActionsKey = (keys) => {
  const actionsKeys = [
    'leftClick',
    'rightClick',
    'middleClick',
    'wheelActionUp',
    'wheelActionDown',
    'actions'
  ]
  const result: (boolean | { name: string; key: string })[] = [] // Change the type of 'result' array
  actionsKeys.map((key) => {
    const [filteredKey] = keys.value.filter((k) => k.name === key)
    if (filteredKey) result.push(filteredKey)
    else result.push(false)
  })
  return result
}

export const isMobile = () => {
  return navigator.userAgent.match(
    /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/
  );
}
