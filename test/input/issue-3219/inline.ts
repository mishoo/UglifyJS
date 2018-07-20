interface ICar {
  model: string
  speed: number
  cost: number
}

class Car implements ICar {
  model: string = 'bad'
  speed: number = 10
  cost: number = 10000
}

var myCar: Car = new Car()
myCar.cost += 1

const [blah, blah2] = [1,2]
