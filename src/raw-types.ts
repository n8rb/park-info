// https://transform.tools/json-to-typescript

export interface LiveData {
  id: string;
  name: string;
  entityType: string;
  timezone: string;
  liveData: LiveDaum[];
}

export interface LiveDaum {
  id: string;
  name: string;
  entityType: string;
  parkId?: string;
  externalId: string;
  status: string;
  lastUpdated: string;
  queue?: Queue;
  operatingHours?: OperatingHour[];
  showtimes?: Showtime[];
  forecast?: Forecast[];
  diningAvailability?: DiningAvailability[];
}

export interface Queue {
  STANDBY?: Standby;
  RETURN_TIME?: ReturnTime;
  SINGLE_RIDER?: SingleRider;
  PAID_RETURN_TIME?: PaidReturnTime;
  BOARDING_GROUP?: BoardingGroup;
}

export interface Standby {
  waitTime?: number;
}

export interface ReturnTime {
  state: string;
  returnEnd: any;
  returnStart?: string;
}

export interface SingleRider {
  waitTime: any;
}

export interface PaidReturnTime {
  price: Price;
  state: string;
  returnEnd: any;
  returnStart: any;
}

export interface Price {
  amount: number;
  currency: string;
  formatted: string;
}

export interface BoardingGroup {
  estimatedWait: any;
  currentGroupEnd: any;
  allocationStatus: string;
  currentGroupStart: any;
  nextAllocationTime: string;
}

export interface OperatingHour {
  type: string;
  endTime: string;
  startTime: string;
}

export interface Showtime {
  type: string;
  endTime: string;
  startTime: string;
}

export interface Forecast {
  time: string;
  waitTime: number;
  percentage: number;
}

export interface DiningAvailability {
  waitTime: number;
  partySize: number;
}

export interface EntityDetails {
  id: string;
  name: string;
  parkId: string;
  location: Location;
  parentId: string;
  timezone: string;
  entityType: string;
  destinationId: string;
  attractionType: string;
  unsuitableForPregnantPeople: boolean;
  externalId: string;
}
export interface Location {
  latitude: number;
  longitude: number;
  pointsOfInterest?: null[] | null;
}
