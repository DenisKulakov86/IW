import { animation, trigger, animateChild, group, transition, animate, style, query, state, stagger } from '@angular/animations';


export const slideInAnimation =
    trigger('routeAnimations', [
        transition("* <=> *", [
            style({ position: 'relative' }),
            query(':enter, :leave', [style({ position: 'absolute',  width: '100%' })], { optional: true }),
            query(":enter", [style({ opacity: 0 })], { optional: true }),
            query(':leave', animate('300ms ease-out', style({ opacity: 0 })), { optional: true }),
            query(':enter', animate('300ms ease-out', style({ opacity: 1 })), { optional: true }),
            // animate(200, style({ opacity: "*", "background-color": "*", }))
        ])
    ]);

export const slide = trigger("slide", [
    state("out", style({
        transform: 'translateX(0)',
    })),
    transition(":enter", [
        style({
            transform: 'translateX(-50%)',
        }),
        animate(2500)
    ]),
    transition(":leave", [
        animate(2500, style({ transform: 'translateX(50%)', }))
    ]),
]);

export const salesListAnim = trigger("salesListAnim", [
    state("false", style({})),
    state('true', style({})),
    transition("*<=>*", [
        // style({ "overflow-y": "scroll" }),

        // query(":leave", [
        //     style({ opacity: 1, }),
        //     stagger(-100, [
        //         animate(200, style({ opacity: 0, transform: 'translateY(100px)' }))
        //     ])
        // ], { optional: true}),

        query(":enter", [
            style({ opacity: 0, transform: 'translateY(-100px)',   position: "absolute1" }),
            stagger(-30, [
                animate(150, style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ], { optional: true,}),
    ])
]);