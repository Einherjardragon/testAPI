import { Entity, PrimaryGeneratedColumn, Index, Column } from "typeorm";

Index(["caseName"]);

@Entity()
export class TourCarMapping {

    @PrimaryGeneratedColumn("increment", { type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 128, width: 128, default: null })
    patientId: string;

    @Column({ type: 'longtext', default: null })
    accNumbers: string;

    @Column({ type: 'longtext', default: null })
    mapping_data: string;

}
