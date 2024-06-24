import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService],
    });

    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    // Clear all localStorage after each test to prevent cross-test contamination
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set an item in localStorage', () => {
    const itemName = 'testItem';
    const itemValue = 'testValue';

    service.setItem(itemName, itemValue);

    const storedValue = localStorage.getItem(service.getItemName(itemName));
    expect(storedValue).toBe(itemValue);
  });

  it('should get an item from localStorage', () => {
    const itemName = 'testItem';
    const itemValue = 'testValue';

    localStorage.setItem(service.getItemName(itemName), itemValue);

    const retrievedValue = service.getItem(itemName);
    expect(retrievedValue).toBe(itemValue);
  });

  it('should remove an item from localStorage', () => {
    const itemName = 'testItem';
    const itemValue = 'testValue';

    localStorage.setItem(service.getItemName(itemName), itemValue);
    service.removeItem(itemName);

    const storedValue = localStorage.getItem(service.getItemName(itemName));
    expect(storedValue).toBeNull();
  });

  it('should return null when getting a non-existent item', () => {
    const itemName = 'nonExistentItem';
    const retrievedValue = service.getItem(itemName);

    expect(retrievedValue).toBeNull();
  });

  it('should correctly prefix item names', () => {
    const itemName = 'testItem';
    const prefixedName = service['getItemName'](itemName);

    expect(prefixedName).toBe(service.getItemName(itemName));
  });
});
