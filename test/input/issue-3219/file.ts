interface ICar {
  model: string
  speed: number
  cost: number
}

class Car implements ICar {
  model: string = 'nice'
  speed: number = 100
  cost: number = 1000000
}

var myCar: Car = new Car()
myCar.cost += 1

const [blah, blah2] = [1,2]
