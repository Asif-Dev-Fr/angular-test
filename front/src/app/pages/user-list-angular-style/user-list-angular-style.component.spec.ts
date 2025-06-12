import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListAngularStyleComponent } from './user-list-angular-style.component';

describe('UserListAngularStyleComponent', () => {
  let component: UserListAngularStyleComponent;
  let fixture: ComponentFixture<UserListAngularStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListAngularStyleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListAngularStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
