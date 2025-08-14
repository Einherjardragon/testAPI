import { Entity, PrimaryGeneratedColumn, Index, Column } from "typeorm";

@Entity()
export class TourCar {

    @PrimaryGeneratedColumn("increment", { type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    job: string;

    @Column({ type: 'varchar', length: 256, width: 256, default: '0' })
    name: string;

    @Column({ type: 'int', default: 0 })
    series: number;

    @Column({ type: 'varchar', length: 128, width: 128, default: "Pending" })
    status: string;

    @Column({ type: 'datetime', default: null })
    time: Date;
}
