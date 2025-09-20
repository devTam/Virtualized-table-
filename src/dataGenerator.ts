import { TableRow } from "./types"

const roles: TableRow["role"][] = ["admin", "user", "moderator", "guest"]
const statuses: TableRow["status"][] = [
  "active",
  "inactive",
  "pending",
  "suspended",
]
const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Support",
  "Product",
  "Design",
  "Legal",
]

const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emily",
  "Robert",
  "Jessica",
  "William",
  "Ashley",
  "James",
  "Amanda",
  "Christopher",
  "Jennifer",
  "Daniel",
  "Lisa",
  "Matthew",
  "Nancy",
  "Anthony",
  "Karen",
  "Mark",
  "Betty",
  "Donald",
  "Helen",
  "Steven",
  "Sandra",
  "Paul",
  "Donna",
  "Andrew",
  "Carol",
  "Joshua",
  "Ruth",
  "Kenneth",
  "Sharon",
  "Kevin",
  "Michelle",
  "Brian",
  "Laura",
  "George",
  "Sarah",
  "Timothy",
  "Kimberly",
  "Ronald",
  "Deborah",
  "Jason",
  "Dorothy",
  "Edward",
  "Lisa",
  "Jeffrey",
  "Nancy",
  "Ryan",
  "Karen",
  "Jacob",
  "Betty",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
]

const emailDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "company.com",
  "example.org",
  "test.net",
  "demo.io",
  "sample.co",
  "business.com",
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomName(): { firstName: string; lastName: string } {
  return {
    firstName: getRandomElement(firstNames),
    lastName: getRandomElement(lastNames),
  }
}

function generateEmail(firstName: string, lastName: string): string {
  const domain = getRandomElement(emailDomains)
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}.${lastName.charAt(0).toLowerCase()}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`,
  ]
  return getRandomElement(variations)
}

function generateRandomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
  return date.toISOString().split("T")[0]
}

function generateScore(): number {
  // Generate scores with a normal distribution around 75
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  const score = Math.round(75 + z0 * 15)
  return Math.max(0, Math.min(100, score))
}

export function generateTableData(count: number = 100000): TableRow[] {
  const data: TableRow[] = []
  const startDate = new Date("2020-01-01")
  const endDate = new Date()

  for (let i = 0; i < count; i++) {
    const { firstName, lastName } = generateRandomName()
    const name = `${firstName} ${lastName}`
    const email = generateEmail(firstName, lastName)
    const joinDate = generateRandomDate(startDate, endDate)
    const lastLoginDate = new Date(joinDate)
    lastLoginDate.setDate(
      lastLoginDate.getDate() + Math.floor(Math.random() * 365)
    )

    data.push({
      id: `user-${i + 1}`,
      name,
      email,
      role: getRandomElement(roles),
      status: getRandomElement(statuses),
      score: generateScore(),
      department: getRandomElement(departments),
      joinDate,
      lastLogin: lastLoginDate.toISOString().split("T")[0],
    })
  }

  return data
}
